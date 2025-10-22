export interface CloudTalkCall {
  id: string;
  type: 'incoming' | 'outgoing';
  billsec: string;
  talking_time: string;
  started_at: string;
  answered_at: string | null;
  user_id: string;
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