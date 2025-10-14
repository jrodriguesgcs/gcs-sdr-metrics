import React, { useState } from 'react';
import { SDRMetrics } from '../types';
import { calculatePercentage } from '../utils/metricsUtils';
import TimeToDistribution from './TimeToDistribution';

interface Tab1Props {
  metrics: SDRMetrics[];
}

export default function Tab1Distribution({ metrics }: Tab1Props) {
  const [expandedAna, setExpandedAna] = useState<{ [key: string]: boolean }>({});
  const [expandedRuffa, setExpandedRuffa] = useState<{ [key: string]: boolean }>({});

  const [anaMetrics, ruffaMetrics] = metrics;

  const toggleExpand = (sdr: 'ana' | 'ruffa', owner: string, country: string) => {
    const key = `${owner}-${country}`;
    if (sdr === 'ana') {
      setExpandedAna(prev => ({ ...prev, [key]: !prev[key] }));
    } else {
      setExpandedRuffa(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const getTotalDeals = (metricsData: SDRMetrics) => {
    return Object.values(metricsData.dealsByOwner).reduce((sum, owner) => sum + owner.total, 0);
  };

  const renderSDRTable = (
    metricsData: SDRMetrics,
    expanded: { [key: string]: boolean },
    sdr: 'ana' | 'ruffa'
  ) => {
    const totalDeals = getTotalDeals(metricsData);
    const owners = Object.keys(metricsData.dealsByOwner).sort();

    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800">
          <h3 className="text-base font-semibold text-white">{metricsData.sdrAgent}</h3>
          <p className="text-slate-300 text-sm mt-0.5">Total Deals Distributed: {totalDeals}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Deal Owner</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Country / Program</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Count</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">% of Total</th>
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
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => toggleExpand(sdr, owner, country)}
                      >
                        {countryIdx === 0 ? (
                          <td
                            className="px-6 py-3 text-sm font-medium text-gray-900 border-r border-gray-200"
                            rowSpan={countries.length}
                          >
                            {owner}
                          </td>
                        ) : null}
                        <td className="px-6 py-3">
                          <div className="flex items-center text-sm">
                            <span className="mr-2 text-blue-600 text-xs">{isExpanded ? '▼' : '▶'}</span>
                            <span className="font-medium text-gray-900">{country}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-right text-sm font-semibold text-gray-900">{countryData.total}</td>
                        <td className="px-6 py-3 text-right text-sm font-medium text-blue-600">
                          {calculatePercentage(countryData.total, totalDeals)}
                        </td>
                      </tr>
                      {isExpanded &&
                        programs.map(program => (
                          <tr key={`${key}-${program}`} className="bg-blue-50">
                            <td colSpan={2} className="px-6 py-2.5 text-sm text-gray-700 pl-16">
                              {program}
                            </td>
                            <td className="px-6 py-2.5 text-right text-sm text-gray-900">
                              {countryData.byProgram[program]}
                            </td>
                            <td className="px-6 py-2.5 text-right text-sm text-blue-600">
                              {calculatePercentage(countryData.byProgram[program], totalDeals)}
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
      <h2 className="text-xl font-bold text-gray-900 mb-4">Bookings Before Distribution</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Ana Pascoal</h4>
          <div className="text-4xl font-bold text-blue-600">{anaMetrics.bookingsBeforeDistribution}</div>
          <p className="text-sm text-gray-500 mt-2">
            {calculatePercentage(anaMetrics.bookingsBeforeDistribution, getTotalDeals(anaMetrics))} of total deals
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Ruffa Espejon</h4>
          <div className="text-4xl font-bold text-blue-600">{ruffaMetrics.bookingsBeforeDistribution}</div>
          <p className="text-sm text-gray-500 mt-2">
            {calculatePercentage(ruffaMetrics.bookingsBeforeDistribution, getTotalDeals(ruffaMetrics))} of total deals
          </p>
        </div>
      </div>
    </div>
  );

  const renderPartnerSection = () => (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Sent to Partner</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: 'Ana Pascoal', data: anaMetrics },
          { name: 'Ruffa Espejon', data: ruffaMetrics },
        ].map(({ name, data }) => {
          const total = getTotalDeals(data);
          return (
            <div key={name} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <div className="bg-slate-900 px-6 py-3 border-b border-slate-800">
                <h4 className="text-base font-semibold text-white">{name}</h4>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">AT Legal - Greece</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">{data.sentToPartner.atLegalGreece}</span>
                    <span className="text-sm text-blue-600 ml-2">
                      {calculatePercentage(data.sentToPartner.atLegalGreece, total)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">MPC Legal - Cyprus</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">{data.sentToPartner.mpcLegalCyprus}</span>
                    <span className="text-sm text-blue-600 ml-2">
                      {calculatePercentage(data.sentToPartner.mpcLegalCyprus, total)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Rafaela Barbosa - Italy CBD</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">{data.sentToPartner.rafaelaBarbosaItalyCBD}</span>
                    <span className="text-sm text-blue-600 ml-2">
                      {calculatePercentage(data.sentToPartner.rafaelaBarbosaItalyCBD, total)}
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
      {/* Time to Distribution Tables */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Time to Distribution</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TimeToDistribution metrics={anaMetrics} />
          <TimeToDistribution metrics={ruffaMetrics} />
        </div>
      </div>

      {/* Distribution Tables */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Deals Distribution by Owner</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderSDRTable(anaMetrics, expandedAna, 'ana')}
          {renderSDRTable(ruffaMetrics, expandedRuffa, 'ruffa')}
        </div>
      </div>

      {renderBookingsSection()}
      {renderPartnerSection()}
    </div>
  );
}