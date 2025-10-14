import { Deal, SDRMetrics, DateFilter } from '../types';
import { getDateRange, isDateInRange } from './dateUtils';

function calculateTimeInterval(startDate: string, endDate: string): string | null {
  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Exclude negative values (creation after distribution)
  if (end < start) return null;

  const diffMs = end.getTime() - start.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin <= 30) return '0-30 min';
  if (diffMin <= 60) return '30-60 min';

  const diffHrs = Math.floor(diffMin / 60);
  return `${diffHrs}-${diffHrs + 1} hrs`;
}

export function calculateMetrics(deals: Deal[], dateFilter: DateFilter): SDRMetrics[] {
  const { start, end } = getDateRange(dateFilter);

  const anaMetrics: SDRMetrics = {
    sdrAgent: 'Ana Pascoal',
    dealsByOwner: {},
    timeToDistribution: {},
    bookingsBeforeDistribution: 0,
    sentToPartner: {
      atLegalGreece: 0,
      mpcLegalCyprus: 0,
      rafaelaBarbosaItalyCBD: 0,
    },
    automationMetrics: {
      noInterest: 0,
      portugalD7: 0,
      portugalTax: 0,
      portugalLegal: 0,
      serviceNotAvailable: 0,
      futureOpportunity: 0,
      unresponsiveUnqualified: 0,
      tagToDelete: 0,
      ineligible: 0,
    },
  };

  const ruffaMetrics: SDRMetrics = {
    sdrAgent: 'Ruffa Espejon',
    dealsByOwner: {},
    timeToDistribution: {},
    bookingsBeforeDistribution: 0,
    sentToPartner: {
      atLegalGreece: 0,
      mpcLegalCyprus: 0,
      rafaelaBarbosaItalyCBD: 0,
    },
    automationMetrics: {
      noInterest: 0,
      portugalD7: 0,
      portugalTax: 0,
      portugalLegal: 0,
      serviceNotAvailable: 0,
      futureOpportunity: 0,
      unresponsiveUnqualified: 0,
      tagToDelete: 0,
      ineligible: 0,
    },
  };

  deals.forEach(deal => {
    const { customFields } = deal;
    const sdrAgent = customFields.sdrAgent?.trim();

    if (!sdrAgent || (sdrAgent !== 'Ana Pascoal' && sdrAgent !== 'Ruffa Espejon')) {
      return;
    }

    const metrics = sdrAgent === 'Ana Pascoal' ? anaMetrics : ruffaMetrics;

    // Distribution metrics - only if sendToAutomation is blank
    if (
      customFields.distributionTime &&
      isDateInRange(customFields.distributionTime, start, end) &&
      !customFields.sendToAutomation
    ) {
      const owner = deal.owner || 'Unassigned';
      const country = customFields.primaryCountry || 'Unknown';
      const program = customFields.primaryProgram || 'Unknown';

      if (!metrics.dealsByOwner[owner]) {
        metrics.dealsByOwner[owner] = {
          total: 0,
          byCountry: {},
        };
      }

      if (!metrics.dealsByOwner[owner].byCountry[country]) {
        metrics.dealsByOwner[owner].byCountry[country] = {
          total: 0,
          byProgram: {},
        };
      }

      metrics.dealsByOwner[owner].total++;
      metrics.dealsByOwner[owner].byCountry[country].total++;
      metrics.dealsByOwner[owner].byCountry[country].byProgram[program] =
        (metrics.dealsByOwner[owner].byCountry[country].byProgram[program] || 0) + 1;

      // Time to Distribution calculation
      const interval = calculateTimeInterval(
        customFields.dealCreationDateTime || '',
        customFields.distributionTime
      );
      if (interval) {
        metrics.timeToDistribution[interval] = (metrics.timeToDistribution[interval] || 0) + 1;
      }

      // Bookings before distribution
      if (customFields.calendlyEventCreated && customFields.distributionTime) {
        const calendlyDate = new Date(customFields.calendlyEventCreated);
        const distributionDate = new Date(customFields.distributionTime);
        if (calendlyDate < distributionDate) {
          metrics.bookingsBeforeDistribution++;
        }
      }

      // Partner metrics
      const partner = customFields.partner?.trim();
      if (partner === 'AT Legal - Greece') {
        metrics.sentToPartner.atLegalGreece++;
      } else if (partner === 'MPC Legal') {
        metrics.sentToPartner.mpcLegalCyprus++;
      } else if (partner === 'Rafaela Barbosa - Italy CBD') {
        metrics.sentToPartner.rafaelaBarbosaItalyCBD++;
      }
    }

    // Automation metrics - NO FILTER on distribution time
    // Check if the deal was created in the date range
    if (customFields.sdrAgent && isDateInRange(deal.createdDate, start, end)) {
      const automation = customFields.sendToAutomation?.trim();
      if (automation === 'Interest not Identified') {
        metrics.automationMetrics.noInterest++;
      } else if (automation === 'Paid Consultation Portugal D7') {
        metrics.automationMetrics.portugalD7++;
      } else if (automation === 'Paid Consultation Portugal Taxes') {
        metrics.automationMetrics.portugalTax++;
      } else if (automation === 'Paid Consultation Portugal Legal') {
        metrics.automationMetrics.portugalLegal++;
      }
    }

    // Lost metrics (with Lost Date Time)
    if (customFields.lostDateTime && isDateInRange(customFields.lostDateTime, start, end)) {
      const lostReason = customFields.mqlLostReason?.trim();

      if (lostReason === 'Service not Available') {
        metrics.automationMetrics.serviceNotAvailable++;
      } else if (lostReason === 'Future Opportunities') {
        metrics.automationMetrics.futureOpportunity++;
      } else if (lostReason === 'Unqualified') {
        metrics.automationMetrics.unresponsiveUnqualified++;
      } else if (lostReason === 'Tag to Delete') {
        metrics.automationMetrics.tagToDelete++;
      } else if (lostReason === "Can't Afford/Ineligible") {
        metrics.automationMetrics.ineligible++;
      }
    }
  });

  return [anaMetrics, ruffaMetrics];
}

export function calculatePercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}