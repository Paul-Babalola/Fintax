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
                  title: function(context: { label: string }[]) {
                    return context[0].label;
                  },
                  label: function(context: { parsed: { r: number } }) {
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
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Section */}
      <div className="text-center lg:text-left">
        <div className="inline-flex items-center bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
          Analysis Complete • High Confidence
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent leading-tight mb-6">
          Project Verdict:<br />
          <span className="text-emerald-600">Highly Relevant</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl leading-relaxed mb-8">
          This comprehensive analysis evaluates the core viability of your "Bank-Integrated Tax & Budget Management" concept, 
          synthesizing insights across technical feasibility, market dynamics, and user validation.
        </p>
        {/* Strategic Insight Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 mt-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-amber-900 mb-3">Core Strategic Insight</h3>
              <p className="text-amber-800 leading-relaxed">
                The convergence of the <strong>"Gig Economy"</strong>, <strong>"Open Banking"</strong>, and <strong>"Personal Finance Management"</strong> creates an unprecedented opportunity. 
                While general budgeting apps address broad needs, the combination of tax-specific expense categorization with intelligent budget management 
                represents a high-value, underserved pain point for freelancers in the US and SMEs in Nigeria.
              </p>
            </div>
          </div>
        </div>
      </div>
        
      {/* Feature Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-blue-50 via-blue-50/50 to-indigo-50 border border-blue-200/50 rounded-2xl p-8 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-blue-900">Enhanced Value Proposition</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold text-blue-900 text-sm">Tax-Aware Budgeting</h4>
                <p className="text-blue-700 text-sm">Budgets that automatically account for tax obligations</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold text-blue-900 text-sm">Expense Forecasting</h4>
                <p className="text-blue-700 text-sm">Predict tax-deductible vs. personal expenses</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold text-blue-900 text-sm">Cash Flow Optimization</h4>
                <p className="text-blue-700 text-sm">Plan for quarterly tax payments</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold text-blue-900 text-sm">Goal-Based Savings</h4>
                <p className="text-blue-700 text-sm">Emergency funds, tax reserves, and growth investments</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 via-emerald-50/50 to-green-50 border border-emerald-200/50 rounded-2xl p-8 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-emerald-900">Market Differentiation</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold text-emerald-900 text-sm">Beyond Mint/YNAB</h4>
                <p className="text-emerald-700 text-sm">Tax-integrated budget categories</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold text-emerald-900 text-sm">Freelancer-First</h4>
                <p className="text-emerald-700 text-sm">Irregular income budgeting strategies</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold text-emerald-900 text-sm">Predictive Analytics</h4>
                <p className="text-emerald-700 text-sm">AI-powered spending insights</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-semibold text-emerald-900 text-sm">Compliance Ready</h4>
                <p className="text-emerald-700 text-sm">Export-ready tax documentation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Charts & Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Score Card */}
        <div className="xl:col-span-1 bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-gradient-to-r from-emerald-100 to-blue-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
              Feasibility Assessment
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Project Viability</h3>
            <p className="text-sm text-slate-600">Multi-dimensional analysis</p>
          </div>
          <div className="h-64 mb-8">
            <canvas ref={chartRef}></canvas>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-slate-50 px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-slate-600">
                Updated {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Strategic Assessment */}
        <div className="xl:col-span-2 bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="mb-8">
            <div className="inline-flex items-center bg-gradient-to-r from-slate-100 to-blue-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Strategic Assessment
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Critical Success Factors</h3>
            <p className="text-slate-600">Key insights and risk evaluation</p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4 group hover:bg-emerald-50/50 p-4 rounded-xl transition-colors duration-200">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-emerald-200 transition-shadow flex-shrink-0">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">High Actionability</h4>
                <p className="text-slate-700 leading-relaxed">
                  Technically feasible with established banking APIs and budget management frameworks. Plaid (US) and Mono (Nigeria) provide robust infrastructure, 
                  while modern budget algorithms can leverage transaction categorization for intelligent expense forecasting.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 group hover:bg-blue-50/50 p-4 rounded-xl transition-colors duration-200">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-200 transition-shadow flex-shrink-0">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Strong Market Fit</h4>
                <p className="text-slate-700 leading-relaxed">
                  Clear differentiation from generic budgeting apps. Tax-aware budget management with automated "Deductible vs Non-Deductible" categorization, 
                  irregular income handling, and tax-reserve planning addresses multiple high-value pain points simultaneously.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 group hover:bg-amber-50/50 p-4 rounded-xl transition-colors duration-200">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-amber-200 transition-shadow flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Compliance Considerations</h4>
                <p className="text-slate-700 leading-relaxed">
                  Financial data handling requires robust security measures. SOC2 compliance and adherence to 
                  GDPR/NDPR regulations are critical prerequisites for market entry and user trust.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="mt-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Recommended Next Steps
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Dive Deeper Into Key Areas</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Explore detailed analysis across critical dimensions to validate and refine your implementation strategy
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => onViewChange('tech')}
            className="group bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-8 text-left hover:bg-blue-50/50 hover:border-blue-300/50 hover:shadow-xl hover:shadow-blue-100/25 transition-all duration-300"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Technical Architecture</h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Deep dive into implementation details, API integrations, and technology stack decisions
            </p>
          </button>
          
          <button 
            onClick={() => onViewChange('market')}
            className="group bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-8 text-left hover:bg-emerald-50/50 hover:border-emerald-300/50 hover:shadow-xl hover:shadow-emerald-100/25 transition-all duration-300"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Market Analysis</h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Comprehensive market research, competitive landscape, and user segment analysis
            </p>
          </button>
          
          <button 
            onClick={() => onViewChange('roadmap')}
            className="group bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-8 text-left hover:bg-purple-50/50 hover:border-purple-300/50 hover:shadow-xl hover:shadow-purple-100/25 transition-all duration-300"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Implementation Roadmap</h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Detailed timeline, milestones, SWOT analysis, and strategic implementation phases
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummaryView;