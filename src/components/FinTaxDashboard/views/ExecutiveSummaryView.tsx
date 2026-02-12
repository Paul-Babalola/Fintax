import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import type { ChartConfiguration } from 'chart.js';
import type { FinTaxViewType } from '../FinTaxDashboard';

Chart.register(...registerables);

interface ExecutiveSummaryViewProps {
  onViewChange: (view: FinTaxViewType) => void;
}

const ExecutiveSummaryView: React.FC<ExecutiveSummaryViewProps> = ({ onViewChange }) => {
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
          type: 'radar',
          data: {
            labels: ['Market Relevance', 'Technical Feasibility', 'Implementation Complexity', 'Revenue Potential', 'Competitive Landscape'],
            datasets: [{
              label: 'Project Viability Score',
              data: [9, 8.5, 7.5, 8.8, 6.2],
              backgroundColor: 'rgba(14, 165, 233, 0.1)',
              borderColor: 'rgba(14, 165, 233, 0.8)',
              pointBackgroundColor: 'rgba(14, 165, 233, 1)',
              pointBorderColor: 'rgba(255, 255, 255, 1)',
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8,
              borderWidth: 3,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { 
                display: false 
              },
              tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: 'rgba(14, 165, 233, 0.5)',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: false,
                titleFont: {
                  size: 14,
                  weight: 'bold'
                },
                bodyFont: {
                  size: 13
                },
                callbacks: {
                  title: function(context: any) {
                    return context[0].label;
                  },
                  label: function(context: any) {
                    return `Score: ${context.parsed.r}/10`;
                  }
                }
              }
            },
            scales: {
              r: {
                angleLines: { 
                  color: 'rgba(148, 163, 184, 0.3)',
                  lineWidth: 1
                },
                grid: { 
                  color: 'rgba(148, 163, 184, 0.2)',
                  lineWidth: 1
                },
                pointLabels: {
                  font: { 
                    size: 11, 
                    family: 'Inter',
                    weight: 'normal'
                  },
                  color: '#475569',
                  padding: 8
                },
                ticks: {
                  display: false
                },
                suggestedMin: 0,
                suggestedMax: 10,
                beginAtZero: true
              }
            },
            elements: {
              line: {
                tension: 0.2
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
    <div className="fade-in-up">
      <div className="mb-12">
        <h2 className="section-title">Project Verdict: Highly Relevant</h2>
        <p className="section-subtitle">
          This comprehensive analysis evaluates the core viability of your "Bank-Integrated Tax & Budget" concept, 
          synthesizing insights across technical feasibility, market dynamics, and user validation.
        </p>
        <div className="insight-callout mt-8">
          <h4 className="font-bold text-amber-800 mb-2 flex items-center">
            <span className="mr-2">💡</span>
            Core Strategic Insight
          </h4>
          <p className="text-amber-700 leading-relaxed">
            The convergence of the <strong>"Gig Economy"</strong> and <strong>"Open Banking"</strong> creates an unprecedented opportunity. 
            While general budgeting apps address broad needs, tax-specific expense categorization represents a high-value, underserved pain point 
            for freelancers in the US and SMEs in Nigeria.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Score Card */}
        <div className="professional-card p-8 flex flex-col fade-in-up">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Feasibility Assessment</h3>
            <p className="text-sm text-slate-600">Multi-dimensional project viability analysis</p>
          </div>
          <div className="flex-grow flex items-center justify-center">
            <div className="chart-container">
              <canvas ref={chartRef}></canvas>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-xs text-center text-slate-500 font-medium">
              Analysis based on current fintech landscape • Updated {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Key Takeaways */}
        <div className="professional-card p-8 fade-in-up">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Strategic Assessment</h3>
            <p className="text-sm text-slate-600">Critical success factors and risk evaluation</p>
          </div>
          <div className="space-y-6">
            <div className="flex items-start group">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-3 rounded-xl mr-4 shadow-lg group-hover:shadow-emerald-200 transition-shadow">
                <span className="text-sm font-bold">✓</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 mb-1">High Actionability</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Technically feasible with established banking APIs. Plaid (US) and Mono (Nigeria) provide robust infrastructure, 
                  eliminating complex financial integration challenges.
                </p>
              </div>
            </div>
            <div className="flex items-start group">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-xl mr-4 shadow-lg group-hover:shadow-blue-200 transition-shadow">
                <span className="text-sm font-bold">↗</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 mb-1">Strong Market Fit</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Clear differentiation from generic budgeting apps. Automated "Deductible vs Non-Deductible" categorization 
                  addresses a specific, high-value pain point.
                </p>
              </div>
            </div>
            <div className="flex items-start group">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-3 rounded-xl mr-4 shadow-lg group-hover:shadow-amber-200 transition-shadow">
                <span className="text-sm font-bold">⚠</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 mb-1">Compliance Considerations</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Financial data handling requires robust security measures. SOC2 compliance and adherence to 
                  GDPR/NDPR regulations are critical prerequisites.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="mt-16">
        <div className="mb-8">
          <h3 className="text-xl font-bold text-slate-800 mb-2">Recommended Next Steps</h3>
          <p className="text-slate-600">Explore detailed analysis across key dimensions</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 fade-in-up">
          <button 
            onClick={() => onViewChange('tech')}
            className="btn-primary group flex items-center justify-center space-x-3"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">⚙️</span>
            <span>Technical Architecture</span>
          </button>
          <button 
            onClick={() => onViewChange('market')}
            className="btn-secondary group flex items-center justify-center space-x-3"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">🌍</span>
            <span>Market Analysis</span>
          </button>
          <button 
            onClick={() => onViewChange('roadmap')}
            className="btn-secondary group flex items-center justify-center space-x-3"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">🚀</span>
            <span>Implementation Roadmap</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummaryView;