import React, { useState } from 'react';
import { SDRMetrics } from '../types';
import { calculatePercentage } from '../utils/metricsUtils';

interface Tab1Props {
  metrics: SDRMetrics[];
}

export default function Tab1Distribution({ metrics }: Tab1Props) {
  const [expandedAna, setExpandedAna] = useState<{ [key: string]: boolean }>({});
  const [expandedRuffa, setExpandedRuffa] = useState<{ [key: string]: boolean }>({});

  const [anaMetrics, ruffaMetrics] = metrics;

  const toggleExpand = (
    sdr: 'ana' | 'ruffa',
    owner: string,
    country: string
  ) => {
    const key = `${owner}-${country}`;
    if (sdr === 'ana') {
      setExpandedAna(prev => ({ ...prev, [key]: !prev[key] }));
    } else {
      setExpandedRuffa(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const getTotalDeals = (metricsData: SDRMetrics) => {
    return Object.values(metricsData.dealsByOwner).reduce(
      (sum, owner) => sum + owner.total,
      0
    );
  };

  const renderSDRTable = (
    metricsData: SDRMetrics,
    expanded: { [key: string]: boolean },
    sdr: 'ana' | 'ruffa'
  ) => {
    const totalDeals = getTotalDeals(metricsData);
    const owners = Object.keys(metricsData.dealsByOwner).sort();

    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-night-blue px-6 py-4">
          <h3 className="text-xl font-bold text-white">{metricsData.sdrAgent}</h3>
          <p className="text-electric-blue-100 text-sm mt-1">
            Total Deals Distributed: {totalDeals}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-electric-blue-20">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-night-blue">
                  Deal Owner
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-night-blue">
                  Country / Program
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-night-blue">
                  Count
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-night-blue">
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {owners.map(owner => {
                const ownerData = metricsData.dealsByOwner[owner];
                const countries = Object.keys(ownerData.byCountry).sort();

                return countries.map((country, countryIdx) => {
                  const countryData = ownerData.byCountry[country];
                  const key = `${owner}-${country}`;
                  const isExpanded = expanded[key];
                  const programs = Object.keys(countryData.byProgram).sort();

                  return (
                    <React.Fragment key={key}>
                      <tr
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleExpand(sdr, owner, country)}
                      >
                        {countryIdx === 0 ? (
                          <td
                            className="px-4 py-3 font-medium text-night-blue border-r border-gray-200"
                            rowSpan={countries.length}
                          >
                            {owner}
                          </td>
                        ) : null}
                        <td className="px-4 py-3 text-night-blue-200">
                          <div className="flex items-center">
                            <span className="mr-2">
                              {isExpanded ? '▼' : '▶'}
                            </span>
                            <span className="font-medium">{country}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-night-blue">
                          {countryData.total}
                        </td>
                        <td className="px-4 py-3 text-right text-electric-blue-700">
                          {calculatePercentage(countryData.total, totalDeals)}
                        </td>
                      </tr>
                      {isExpanded &&
                        programs.map(program => (
                          <tr key={`${key}-${program}`} className="bg-gray-50">
                            <td className="px-4 py-2 text-sm text-night-blue-200 pl-12">
                              {program}
                            </td>
                            <td className="px-4 py-2 text-right text-sm text-night-blue">
                              {countryData.byProgram[program]}
                            </td>
                            <td className="px-4 py-2 text-right text-sm text-electric-blue-600">
                              {calculatePercentage(
                                countryData.byProgram[program],
                                totalDeals
                              )}
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderBookingsSection = () => (
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-night-blue mb-4">
        Bookings Before Distribution
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-lg font-semibold text-night-blue mb-2">
            Ana Pascoal
          </h4>
          <div className="text-4xl font-bold text-electric-blue">
            {anaMetrics.bookingsBeforeDistribution}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {calculatePercentage(
              anaMetrics.bookingsBeforeDistribution,
              getTotalDeals(anaMetrics)
            )}{' '}
            of total deals
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-lg font-semibold text-night-blue mb-2">
            Ruffa Espejon
          </h4>
          <div className="text-4xl font-bold text-electric-blue">
            {ruffaMetrics.bookingsBeforeDistribution}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {calculatePercentage(
              ruffaMetrics.bookingsBeforeDistribution,
              getTotalDeals(ruffaMetrics)
            )}{' '}
            of total deals
          </p>
        </div>
      </div>
    </div>
  );

  const renderPartnerSection = () => (
    <div className="mt-8">
      <h3 className="text-2xl font-bold text-night-blue mb-4">Sent to Partner</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: 'Ana Pascoal', data: anaMetrics },
          { name: 'Ruffa Espejon', data: ruffaMetrics },
        ].map(({ name, data }) => {
          const total = getTotalDeals(data);
          return (
            <div key={name} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-night-blue px-6 py-3">
                <h4 className="text-lg font-bold text-white">{name}</h4>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-night-blue">AT Legal - Greece</span>
                  <div className="text-right">
                    <span className="font-semibold text-night-blue">
                      {data.sentToPartner.atLegalGreece}
                    </span>
                    <span className="text-sm text-electric-blue-600 ml-2">
                      {calculatePercentage(data.sentToPartner.atLegalGreece, total)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-night-blue">MPC Legal - Cyprus</span>
                  <div className="text-right">
                    <span className="font-semibold text-night-blue">
                      {data.sentToPartner.mpcLegalCyprus}
                    </span>
                    <span className="text-sm text-electric-blue-600 ml-2">
                      {calculatePercentage(data.sentToPartner.mpcLegalCyprus, total)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-night-blue">Rafaela Barbosa - Italy CBD</span>
                  <div className="text-right">
                    <span className="font-semibold text-night-blue">
                      {data.sentToPartner.rafaelaBarbosaItalyCBD}
                    </span>
                    <span className="text-sm text-electric-blue-600 ml-2">
                      {calculatePercentage(
                        data.sentToPartner.rafaelaBarbosaItalyCBD,
                        total
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderSDRTable(anaMetrics, expandedAna, 'ana')}
        {renderSDRTable(ruffaMetrics, expandedRuffa, 'ruffa')}
      </div>

      {renderBookingsSection()}
      {renderPartnerSection()}
    </div>
  );
}