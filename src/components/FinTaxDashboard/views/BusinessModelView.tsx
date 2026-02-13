import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import type { ChartConfiguration } from 'chart.js';

Chart.register(...registerables);

const BusinessModelView: React.FC = () => {
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
          type: 'line',
          data: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8'],
            datasets: [{
              label: 'Revenue Growth ($)',
              data: [0, 650, 3200, 10500, 19500, 36000, 58000, 95000],
              borderColor: '#0f766e',
              backgroundColor: 'rgba(20, 184, 166, 0.1)',
              fill: true,
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: '#f3f4f6' }
              },
              x: {
                grid: { display: false }
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
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Business & Revenue Model</h2>
        <p className="text-gray-600 max-w-3xl">
          How will this make money? The "Freemium" model with budget management creates multiple revenue streams: specialized "Tax Reports", 
          "Premium Budget Features", and "Financial Advisory Services" offer high-value upsells.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Free Tier */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-gray-400 flex flex-col">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Basic</h3>
          <p className="text-3xl font-bold text-gray-400 mb-4">$0 <span className="text-sm font-normal">/mo</span></p>
          <ul className="text-sm text-gray-600 space-y-2 mb-6 flex-grow">
            <li>• Link 1 Bank Account</li>
            <li>• Basic Income/Expense Tracking</li>
            <li>• Manual Categorization</li>
            <li>• Simple Budget Creation (3 categories)</li>
          </ul>
          <button className="w-full py-2 border border-gray-300 rounded text-gray-600 font-medium">Acquisition Hook</button>
        </div>

        {/* Pro Tier */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-teal-600 transform scale-105 flex flex-col z-10 relative">
          <div className="absolute top-0 right-0 bg-teal-600 text-white text-xs px-2 py-1 rounded-bl">RECOMMENDED</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Freelancer Pro</h3>
          <p className="text-3xl font-bold text-teal-700 mb-4">$15 <span className="text-sm font-normal">/mo</span></p>
          <ul className="text-sm text-gray-600 space-y-2 mb-6 flex-grow">
            <li>• Unlimited Bank Accounts</li>
            <li>• <strong>AI Auto-Categorization</strong></li>
            <li>• <strong>Smart Budget Management</strong></li>
            <li>• Tax-Aware Budget Categories</li>
            <li>• Irregular Income Planning</li>
            <li>• Real-time Tax Estimation</li>
            <li>• Receipt Scanning & Goals</li>
          </ul>
          <button className="w-full py-2 bg-teal-600 text-white rounded font-medium hover:bg-teal-700 transition">Target Product</button>
        </div>

        {/* Enterprise Tier */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-gray-800 flex flex-col">
          <h3 className="text-xl font-bold text-gray-800 mb-2">SME / Business</h3>
          <p className="text-3xl font-bold text-gray-800 mb-4">$59 <span className="text-sm font-normal">/mo</span></p>
          <ul className="text-sm text-gray-600 space-y-2 mb-6 flex-grow">
            <li>• Multi-user Access</li>
            <li>• <strong>Team Budget Collaboration</strong></li>
            <li>• Department-wise Budget Tracking</li>
            <li>• Export to QuickBooks/Xero</li>
            <li>• Advanced Financial Reporting</li>
            <li>• Invoicing Features</li>
            <li>• Priority Support</li>
          </ul>
          <button className="w-full py-2 border border-gray-300 rounded text-gray-600 font-medium">Scale Product</button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Revenue Projection (Year 1-3)</h3>
          <p className="text-sm text-gray-500 mb-4">Projected growth based on 5% conversion from Free to Pro.</p>
          <div style={{ height: '250px' }}>
            <canvas ref={chartRef}></canvas>
          </div>
        </div>
        <div className="w-full md:w-1/2 p-4 border-l border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Cost Drivers</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>API Fees (Plaid/Mono)</span>
                <span>40%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Cloud Infrastructure</span>
                <span>25%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Marketing (CAC)</span>
                <span>35%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessModelView;