import { Deal, DealCustomFieldMeta, LoadingProgress } from '../types';

const API_BASE = '/api/proxy';
const RATE_LIMIT = 5; // 5 requests per second
const WORKER_COUNT = 20;

class RateLimiter {
  private queue: Array<() => void> = [];
  private activeRequests = 0;
  private lastRequestTime = 0;

  async throttle<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const execute = async () => {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        const minInterval = 1000 / RATE_LIMIT;

        if (timeSinceLastRequest < minInterval) {
          await new Promise(r => setTimeout(r, minInterval - timeSinceLastRequest));
        }

        this.lastRequestTime = Date.now();
        this.activeRequests++;

        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.activeRequests--;
          this.processQueue();
        }
      };

      if (this.activeRequests < WORKER_COUNT) {
        execute();
      } else {
        this.queue.push(execute);
      }
    });
  }

  private processQueue() {
    if (this.queue.length > 0 && this.activeRequests < WORKER_COUNT) {
      const next = this.queue.shift();
      if (next) next();
    }
  }
}

const rateLimiter = new RateLimiter();

async function fetchFromProxy(endpoint: string): Promise<any> {
  const response = await fetch(`${API_BASE}?endpoint=${encodeURIComponent(endpoint)}`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchDealCustomFieldMeta(
  onProgress: (progress: LoadingProgress) => void
): Promise<Map<string, string>> {
  onProgress({
    phase: 'metadata',
    message: 'Fetching custom field metadata...',
    current: 0,
    total: 1,
    percentage: 0,
  });

  const data = await rateLimiter.throttle(() => 
    fetchFromProxy('/api/3/dealCustomFieldMeta?limit=100')
  );

  const fieldMap = new Map<string, string>();
  
  if (data.dealCustomFieldMeta) {
    data.dealCustomFieldMeta.forEach((field: DealCustomFieldMeta) => {
      fieldMap.set(field.id, field.fieldLabel);
    });
  }

  onProgress({
    phase: 'metadata',
    message: 'Metadata loaded successfully',
    current: 1,
    total: 1,
    percentage: 100,
  });

  return fieldMap;
}

export async function fetchDeals(
  onProgress: (progress: LoadingProgress) => void
): Promise<Deal[]> {
  const deals: Deal[] = [];
  let offset = 0;
  const limit = 100;
  let hasMore = true;

  onProgress({
    phase: 'deals',
    message: 'Fetching deals...',
    current: 0,
    total: 0,
    percentage: 0,
  });

  while (hasMore) {
    const data = await rateLimiter.throttle(() =>
      fetchFromProxy(`/api/3/deals?limit=${limit}&offset=${offset}`)
    );

    if (data.deals && data.deals.length > 0) {
      deals.push(...data.deals.map((d: any) => ({
        id: d.id,
        title: d.title,
        owner: d.owner || '',
        createdDate: d.cdate || '',
        customFields: {},
      })));

      offset += limit;
      
      onProgress({
        phase: 'deals',
        message: `Fetched ${deals.length} deals...`,
        current: deals.length,
        total: data.meta?.total || deals.length,
        percentage: Math.min(50, (deals.length / (data.meta?.total || deals.length)) * 100),
      });

      hasMore = data.deals.length === limit;
    } else {
      hasMore = false;
    }
  }

  return deals;
}

export async function fetchDealCustomFields(
  dealIds: string[],
  onProgress: (progress: LoadingProgress) => void
): Promise<Map<string, any>> {
  const customFieldsMap = new Map<string, any>();
  let completed = 0;
  const total = dealIds.length;

  onProgress({
    phase: 'customFields',
    message: `Fetching custom fields for ${total} deals...`,
    current: 0,
    total,
    percentage: 0,
  });

  const workers = Array.from({ length: WORKER_COUNT }, async () => {
    while (dealIds.length > 0) {
      const dealId = dealIds.shift();
      if (!dealId) break;

      try {
        const data = await rateLimiter.throttle(() =>
          fetchFromProxy(`/api/3/deals/${dealId}/dealCustomFieldData`)
        );

        const fieldValues: any = {};
        if (data.dealCustomFieldData) {
          data.dealCustomFieldData.forEach((field: any) => {
            fieldValues[field.customFieldId] = field.fieldValue;
          });
        }

        customFieldsMap.set(dealId, fieldValues);
        completed++;

        onProgress({
          phase: 'customFields',
          message: `Processing deal ${completed} of ${total}...`,
          current: completed,
          total,
          percentage: (completed / total) * 100,
        });
      } catch (error) {
        console.error(`Error fetching custom fields for deal ${dealId}:`, error);
        completed++;
      }
    }
  });

  await Promise.all(workers);

  return customFieldsMap;
}

export async function fetchAllDealsWithCustomFields(
  onProgress: (progress: LoadingProgress) => void
): Promise<Deal[]> {
  // Phase 1: Metadata
  await fetchDealCustomFieldMeta(onProgress);

  // Phase 2: Deals
  const deals = await fetchDeals(onProgress);

  // Phase 3: Custom Fields
  const dealIds = deals.map(d => d.id);
  const customFieldsMap = await fetchDealCustomFields(dealIds, onProgress);

  // Phase 4: Merge
  onProgress({
    phase: 'merge',
    message: 'Merging data...',
    current: 0,
    total: deals.length,
    percentage: 0,
  });

  const enrichedDeals = deals.map(deal => {
    const fieldValues = customFieldsMap.get(deal.id) || {};
    
    return {
      ...deal,
      customFields: {
        sdrAgent: fieldValues['74'] || '',
        distributionTime: fieldValues['15'] || '',
        lostDateTime: fieldValues['89'] || '',
        partner: fieldValues['20'] || '',
        mqlLostReason: fieldValues['55'] || '',
        primaryCountry: fieldValues['53'] || '',
        primaryProgram: fieldValues['52'] || '',
        calendlyEventCreated: fieldValues['75'] || '',
        sendToAutomation: fieldValues['54'] || '',
      },
    };
  });

  onProgress({
    phase: 'complete',
    message: 'Data loaded successfully!',
    current: deals.length,
    total: deals.length,
    percentage: 100,
  });

  return enrichedDeals;
}