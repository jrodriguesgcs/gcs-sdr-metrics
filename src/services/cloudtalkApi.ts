interface CloudTalkCall {
  id: string;
  type: 'incoming' | 'outgoing';
  billsec: string;
  talking_time: string;
  started_at: string;
  answered_at: string | null;
  user_id: string;
}

interface CloudTalkAgent {
  id: string;
  firstname: string;
  lastname: string;
  extension: string;
}

const CLOUDTALK_PROXY = '/api/cloudtalk-proxy';

async function fetchFromCloudTalkProxy(endpoint: string): Promise<any> {
  const url = `${CLOUDTALK_PROXY}?endpoint=${encodeURIComponent(endpoint)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`CloudTalk API Error: ${response.statusText}`);
  }

  return response.json();
}

export async function getGCSOperatorUserId(): Promise<string | null> {
  try {
    const data = await fetchFromCloudTalkProxy('/agents/index.json');
    
    if (data.responseData && data.responseData.data) {
      const gcsOperator = data.responseData.data.find((item: any) => 
        item.Agent.extension === '1001' || 
        (item.Agent.firstname + ' ' + item.Agent.lastname).includes('GCS Operator')
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
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching CloudTalk calls:', error);
    return [];
  }
}