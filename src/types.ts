export interface Deal {
  id: string;
  title: string;
  owner: string;
  createdDate: string;
  customFields: {
    sdrAgent?: string;
    distributionTime?: string;
    lostDateTime?: string;
    partner?: string;
    mqlLostReason?: string;
    primaryCountry?: string;
    primaryProgram?: string;
    calendlyEventCreated?: string;
    sendToAutomation?: string;
    dealCreationDateTime?: string;
  };
}

export interface DealCustomFieldMeta {
  id: string;
  fieldLabel: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
}

export interface LoadingProgress {
  phase: 'idle' | 'metadata' | 'deals' | 'customFields' | 'merge' | 'complete';
  message: string;
  current: number;
  total: number;
  percentage: number;
}

export type DateFilter = 'today' | 'yesterday';

export interface SDRMetrics {
  sdrAgent: string;
  totalAgentDeals: number;
  dealsByOwner: {
    [owner: string]: {
      total: number;
      byCountry: {
        [country: string]: {
          total: number;
          byProgram: {
            [program: string]: number;
          };
        };
      };
    };
  };
  timeToDistribution: {
    [interval: string]: number;
  };
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