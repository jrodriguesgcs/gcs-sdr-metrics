export interface CloudTalkCall {
  id: string;
  direction: 'incoming' | 'outgoing';
  status: 'answered' | 'missed';
  start: string;
  duration: number;
  user_id: number;
}

export interface CallMetrics {
  incomingAnswered: number;
  incomingMissed: number;
  incomingTotal: number;
  outgoingAnswered: number;
  outgoingMissed: number;
  outgoingTotal: number;
  grandTotal: number;
}

export interface DailyCallMetrics {
  date: Date;
  incomingAnswered: number;
  incomingMissed: number;
  incomingTotal: number;
  outgoingAnswered: number;
  outgoingMissed: number;
  outgoingTotal: number;
  grandTotal: number;
}