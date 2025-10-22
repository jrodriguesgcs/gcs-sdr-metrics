interface CloudTalkCall {
  id: string;
  direction: 'incoming' | 'outgoing';
  status: 'answered' | 'missed';
  start: string;
  duration: number;
  user_id: number;
}

interface CloudTalkUser {
  id: number;
  name: string;
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

export async function getGCSOperatorUserId(): Promise<number | null> {
  try {
    const data = await fetchFromCloudTalkProxy('/users.json');
    
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
  userId: number,
  dateFrom: string,
  dateTo: string
): Promise<CloudTalkCall[]> {
  try {
    const endpoint = `/calls/index.json?user_id=${userId}&date_from=${encodeURIComponent(dateFrom)}&date_to=${encodeURIComponent(dateTo)}`;
    const data = await fetchFromCloudTalkProxy(endpoint);
    
    return data.calls || [];
  } catch (error) {
    console.error('Error fetching CloudTalk calls:', error);
    return [];
  }
}