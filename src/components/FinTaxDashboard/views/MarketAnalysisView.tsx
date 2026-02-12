import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import type { ChartConfiguration } from 'chart.js';

Chart.register(...registerables);

const MarketAnalysisView: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        const config: ChartConfiguration = {
          type: 'bar',
          data: {
            labels: ['Potential Users (Millions)', 'Est. Annual Growth (%)'],
            datasets: [
              {
                label: 'USA (Freelancers)',
                data: [57, 15],
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
              },
              {
                label: 'Nigeria (SMEs)',
                data: [41, 25],
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: '#f3f4f6' }
              },
              x: {
                grid: { display: false }
              }
            },
            plugins: {
              legend: { position: 'top' },
              tooltip: {
                callbacks: {
                  label: function(context: any) {
                    return context.dataset.label + ': ' + context.raw + (context.dataIndex === 0 ? 'M' : '%');
                  }
                }
              }
            }
          }
        };

        chartInstanceRef.current = new Chart(ctx, config);
      }
    }

    // Cleanup function
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Market Comparison: US vs Nigeria</h2>
        <p className="text-gray-600 max-w-3xl">
          A dual-market strategy is ambitious but viable due to distinct needs. 
          In the US, the driver is <strong>IRS complexity</strong>. In Nigeria, the driver is <strong>Financial Inclusion & SME Digitization</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Market Size Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Target Addressable Market (Users)</h3>
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
            height: '300px',
            maxHeight: '400px'
          }}>
            <canvas ref={chartRef}></canvas>
          </div>
        </div>

        {/* Market Characteristics */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-blue-900">🇺🇸 United States</h3>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">High Competition</span>
            </div>
            <ul className="text-sm space-y-2 text-gray-600">
              <li>• <strong>User Persona:</strong> Freelancers, 1099 Contractors, Gig Workers.</li>
              <li>• <strong>Pain Point:</strong> Quarterly estimated taxes, Schedule C preparation.</li>
              <li>• <strong>Monetization:</strong> Monthly Subscription ($10-$30/mo).</li>
              <li>• <strong>Key Integration:</strong> Plaid (Banking), TaxJar/TurboTax (Export).</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-green-900">🇳🇬 Nigeria</h3>
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">High Growth</span>
            </div>
            <ul className="text-sm space-y-2 text-gray-600">
              <li>• <strong>User Persona:</strong> SME Owners, Instagram Vendors, Tech Workers.</li>
              <li>• <strong>Pain Point:</strong> Mixing personal/business funds, lack of credit history.</li>
              <li>• <strong>Monetization:</strong> Freemium + Transaction fees or Lending.</li>
              <li>• <strong>Key Integration:</strong> Mono / Okra / Paystack.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Insight Block */}
      <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded-r-lg">
        <h4 className="font-bold text-teal-800">💡 Strategic Recommendation</h4>
        <p className="text-sm text-teal-700">
          Start with <strong>one market first</strong> to validate the tech stack. The banking APIs (Plaid vs Mono) are different enough that trying to launch both simultaneously will double your engineering overhead.
        </p>
      </div>
    </div>
  );
};

export default MarketAnalysisView;