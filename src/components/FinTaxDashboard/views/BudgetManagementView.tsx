import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import type { ChartConfiguration } from 'chart.js';

Chart.register(...registerables);

const BudgetManagementView: React.FC = () => {
  const budgetChartRef = useRef<HTMLCanvasElement>(null);
  const budgetChartInstanceRef = useRef<Chart | null>(null);
  const cashFlowChartRef = useRef<HTMLCanvasElement>(null);
  const cashFlowChartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    // Budget Categories Chart
    if (budgetChartRef.current) {
      if (budgetChartInstanceRef.current) {
        budgetChartInstanceRef.current.destroy();
      }

      const ctx = budgetChartRef.current.getContext('2d');
      if (ctx) {
        const config: ChartConfiguration = {
          type: 'doughnut',
          data: {
            labels: ['Business Expenses', 'Personal Expenses', 'Tax Reserve', 'Emergency Fund', 'Savings Goals'],
            datasets: [{
              data: [35, 25, 20, 12, 8],
              backgroundColor: [
                '#3B82F6',
                '#EF4444', 
                '#F59E0B',
                '#10B981',
                '#8B5CF6'
              ],
              borderWidth: 0,
              hoverBackgroundColor: [
                '#2563EB',
                '#DC2626',
                '#D97706',
                '#059669',
                '#7C3AED'
              ]
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom' as const,
                labels: {
                  padding: 20,
                  usePointStyle: true,
                  font: {
                    size: 12
                  }
                }
              },
              tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: 'white',
                bodyColor: 'white',
                callbacks: {
                  label: function(context: { label: string; parsed: number }) {
                    return `${context.label}: ${context.parsed}%`;
                  }
                }
              }
            }
          }
        };

        budgetChartInstanceRef.current = new Chart(ctx, config);
      }
    }

    // Cash Flow Chart
    if (cashFlowChartRef.current) {
      if (cashFlowChartInstanceRef.current) {
        cashFlowChartInstanceRef.current.destroy();
      }

      const ctx2 = cashFlowChartRef.current.getContext('2d');
      if (ctx2) {
        const config: ChartConfiguration = {
          type: 'bar',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
              {
                label: 'Income',
                data: [4500, 3200, 5800, 4200, 6100, 4900],
                backgroundColor: '#10B981',
                borderRadius: 4
              },
              {
                label: 'Expenses',
                data: [3200, 2800, 3600, 3100, 3900, 3400],
                backgroundColor: '#EF4444',
                borderRadius: 4
              },
              {
                label: 'Tax Reserve',
                data: [900, 640, 1160, 840, 1220, 980],
                backgroundColor: '#F59E0B',
                borderRadius: 4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  usePointStyle: true,
                  font: {
                    size: 12
                  }
                }
              }
            },
            scales: {
              x: {
                grid: { display: false }
              },
              y: {
                beginAtZero: true,
                grid: { color: '#f3f4f6' }
              }
            }
          }
        };

        cashFlowChartInstanceRef.current = new Chart(ctx2, config);
      }
    }

    // Cleanup function
    return () => {
      if (budgetChartInstanceRef.current) {
        budgetChartInstanceRef.current.destroy();
        budgetChartInstanceRef.current = null;
      }
      if (cashFlowChartInstanceRef.current) {
        cashFlowChartInstanceRef.current.destroy();
        cashFlowChartInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Budget Management System</h2>
        <p className="text-gray-600 max-w-4xl">
          Beyond basic expense tracking: intelligent budget management that understands freelancer cash flow patterns, 
          tax obligations, and irregular income scenarios. This system bridges the gap between personal finance and business needs.
        </p>
      </div>

      {/* Key Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center mb-4">
            <div className="bg-blue-600 text-white p-3 rounded-lg mr-4">
              <span className="text-xl">🎯</span>
            </div>
            <h3 className="text-lg font-bold text-blue-800">Tax-Aware Budgeting</h3>
          </div>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>• Automatic tax reserve calculation (20-30%)</li>
            <li>• Deductible vs. non-deductible categorization</li>
            <li>• Quarterly tax payment planning</li>
            <li>• Business expense optimization</li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center mb-4">
            <div className="bg-green-600 text-white p-3 rounded-lg mr-4">
              <span className="text-xl">📊</span>
            </div>
            <h3 className="text-lg font-bold text-green-800">Irregular Income Handling</h3>
          </div>
          <ul className="text-sm text-green-700 space-y-2">
            <li>• Variable income smoothing algorithms</li>
            <li>• Emergency fund recommendations</li>
            <li>• Peak and valley cash flow planning</li>
            <li>• Project-based budget allocation</li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center mb-4">
            <div className="bg-purple-600 text-white p-3 rounded-lg mr-4">
              <span className="text-xl">🤖</span>
            </div>
            <h3 className="text-lg font-bold text-purple-800">Smart Predictions</h3>
          </div>
          <ul className="text-sm text-purple-700 space-y-2">
            <li>• AI-powered spending pattern analysis</li>
            <li>• Seasonal expense forecasting</li>
            <li>• Goal achievement probability</li>
            <li>• Budget optimization suggestions</li>
          </ul>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Budget Allocation */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Smart Budget Allocation</h3>
            <p className="text-sm text-gray-500">Recommended distribution for freelancers</p>
          </div>
          <div style={{ height: '300px' }}>
            <canvas ref={budgetChartRef}></canvas>
          </div>
        </div>

        {/* Cash Flow Tracking */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Cash Flow Management</h3>
            <p className="text-sm text-gray-500">Income vs. Expenses with Tax Planning</p>
          </div>
          <div style={{ height: '300px' }}>
            <canvas ref={cashFlowChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Competitive Advantages */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl border border-gray-200 mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Competitive Advantages Over Existing Solutions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm mr-3">vs. Mint</span>
              General vs. Specialized
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• <strong>Tax Integration:</strong> Built-in tax planning vs. generic categories</li>
              <li>• <strong>Freelancer Focus:</strong> Irregular income handling vs. salary-based budgeting</li>
              <li>• <strong>Business Expenses:</strong> Automatic deductible categorization</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm mr-3">vs. YNAB</span>
              Automated vs. Manual
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• <strong>AI Categorization:</strong> Smart automation vs. manual envelope method</li>
              <li>• <strong>Tax-Aware Goals:</strong> Built-in compliance vs. generic goals</li>
              <li>• <strong>Cash Flow Smoothing:</strong> Variable income algorithms</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm mr-3">vs. QuickBooks</span>
              Personal vs. Business-Only
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• <strong>Unified View:</strong> Personal + business expenses in one dashboard</li>
              <li>• <strong>Simplified UX:</strong> Consumer-friendly vs. accountant-focused</li>
              <li>• <strong>Cost Effective:</strong> Freelancer pricing vs. enterprise costs</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-sm mr-3">vs. PocketSmith</span>
              Actionable vs. Analytical
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• <strong>Tax Compliance:</strong> Built-in deduction tracking</li>
              <li>• <strong>Goal-Oriented:</strong> Action-based recommendations</li>
              <li>• <strong>Real-time Alerts:</strong> Proactive budget management</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Implementation Highlights */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Technical Implementation Highlights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">🔄</span>
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Real-time Sync</h4>
            <p className="text-sm text-gray-600">
              Live bank transaction categorization and budget updates via Plaid/Mono APIs
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 text-green-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">📱</span>
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Mobile-First</h4>
            <p className="text-sm text-gray-600">
              Progressive Web App with offline budget tracking and expense capture
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 text-purple-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">⚡</span>
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">Smart Automation</h4>
            <p className="text-sm text-gray-600">
              Machine learning for expense categorization and budget optimization
            </p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-200">
          <p className="text-sm text-teal-700">
            <strong>MVP Development Timeline:</strong> Budget management features can be developed in parallel with core tax functionality, 
            with basic budgeting available in Month 3 and advanced features (AI categorization, cash flow forecasting) in Month 6.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetManagementView;