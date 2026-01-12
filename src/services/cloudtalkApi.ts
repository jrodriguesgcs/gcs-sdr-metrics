import { CloudTalkCall } from '../types/cloudtalk';

const CLOUDTALK_PROXY_BASE = '/api/cloudtalk-proxy';

async function fetchFromCloudTalkProxy(endpoint: string): Promise<any> {
  const url = `${CLOUDTALK_PROXY_BASE}?endpoint=${encodeURIComponent(endpoint)}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`CloudTalk API Error: ${response.statusText}`);
  }

  return response.json();
}

export async function getGCSOperatorUserId(): Promise<string | null> {
  try {
    const data = await fetchFromCloudTalkProxy('/agents/index.json');
    
    if (data.responseData && data.responseData.data) {
      // Find GCS Operator by extension 1001
      const gcsOperator = data.responseData.data.find((item: any) => 
        item.Agent.extension === '1001' || 
        item.Agent.name?.toLowerCase().includes('gcs operator')
      );
      
      return gcsOperator ? gcsOperator.Agent.id : null;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching CloudTalk agents:', error);
    return null;
  }
}

export async function fetchCloudTalkCalls(
  userId: string,
  dateFrom: string,
  dateTo: string
): Promise<CloudTalkCall[]> {
  try {
    // Fetch up to 1000 calls, newest first
    const endpoint = `/calls/index.json?user_id=${userId}&date_from=${encodeURIComponent(dateFrom)}&date_to=${encodeURIComponent(dateTo)}&limit=1000&sort=started_at&order=desc`;
    const data = await fetchFromCloudTalkProxy(endpoint);
    
    if (data.responseData && data.responseData.data) {
      return data.responseData.data.map((item: any) => ({
        id: item.Cdr.id,
        type: item.Cdr.type,
        billsec: item.Cdr.billsec,
        talking_time: item.Cdr.talking_time,
        started_at: item.Cdr.started_at,
        answered_at: item.Cdr.answered_at,
        user_id: item.Cdr.user_id,
        is_voicemail: item.Cdr.is_voicemail || false,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching CloudTalk calls:', error);
    return [];
  }
}