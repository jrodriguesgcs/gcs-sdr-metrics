export type DateFilter = 'today' | 'yesterday' | 'weekly';

// Phone calls specific date filter - includes month options
export type PhoneCallsDateFilter = 'today' | 'yesterday' | 'weekly' | 'currentMonth' | 'lastMonth';

export interface LoadingProgress {
  phase: 'idle' | 'fetching' | 'processing' | 'complete';
  message: string;
  current: number;
  total: number;
  percentage: number;
}

export interface Deal {
  id: string;
  title: string;
  contact: string;
  owner: string;
  value: string;
  currency: string;
  stage: string;
  status: string;
  created: string;
  updated: string;
  customFields: {
    sdrAgent?: string;
    dealOwner?: string;
    distributionTime?: string;
    meetingTime?: string;
    bookingTime?: string;
    clientCountry?: string;
    clientProgram?: string;
    sentToPartner?: string;
    automationStatus?: string;
    mqlLostReason?: string;
  };
}

export interface SDRMetrics {
  sdrAgent: string;
  dealsByOwner: Record<string, number>;
  timeToDistribution: Record<string, number>;
  bookingsBeforeDistribution: number;
  sentToPartner: {
    atLegalGreece: number;
    mpcLegalCyprus: number;
    rafaelaBarbosaItalyCBD: number;
  };
  automationMetrics: {
    noInterest: number;
    portugalD7: number;
    portugalTax: number;
    portugalLegal: number;
    serviceNotAvailable: number;
    futureOpportunity: number;
    unresponsiveUnqualified: number;
    tagToDelete: number;
    ineligible: number;
  };
}