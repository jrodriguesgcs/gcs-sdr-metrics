interface CloudTalkCall {
  id: string;
  direction: 'incoming' | 'outgoing';
  status: 'answered' | 'missed';
  start: string; // datetime
  duration: number;
  user_id: number;
}

interface CloudTalkUser {
  id: number;
  name: string;
  extension: string;
}

const CLOUDTALK_API_BASE = 'https://my.cloudtalk.io/api';

async function fetchFromCloudTalk(endpoint: string, apiKey: string): Promise<any> {
  const url = `${CLOUDTALK_API_BASE}${endpoint}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`CloudTalk API Error: ${response.statusText}`);
  }

  return response.json();
}

export async function getGCSOperatorUserId(apiKey: string): Promise<number | null> {
  try {
    const data = await fetchFromCloudTalk('/users.json', apiKey);
    
    if (data.users) {
      const gcsOperator = data.users.find((user: CloudTalkUser) => 
        user.extension === '1001' || user.name.includes('GCS Operator')
      );
      return gcsOperator ? gcsOperator.id : null;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching CloudTalk users:', error);
    return null;
  }
}

export async function fetchCloudTalkCalls(
  apiKey: string,
  userId: number,
  dateFrom: string,
  dateTo: string
): Promise<CloudTalkCall[]> {
  try {
    const endpoint = `/calls/index.json?user_id=${userId}&date_from=${encodeURIComponent(dateFrom)}&date_to=${encodeURIComponent(dateTo)}`;
    const data = await fetchFromCloudTalk(endpoint, apiKey);
    
    return data.calls || [];
  } catch (error) {
    console.error('Error fetching CloudTalk calls:', error);
    return [];
  }
}