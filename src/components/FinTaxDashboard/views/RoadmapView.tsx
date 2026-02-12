import React from 'react';
import { projectData } from '../FinTaxDashboard';

const RoadmapView: React.FC = () => {
  const handleSwotClick = (item: any) => {
    alert(`${item.desc} (Simulated Expansion)`);
  };

  const getSwotColor = (type: string) => {
    switch (type) {
      case 'strength':
        return 'bg-green-500';
      case 'weakness':
        return 'bg-orange-500';
      case 'opportunity':
        return 'bg-blue-500';
      case 'threat':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="fade-in-up">
      <div className="mb-12">
        <h2 className="section-title">Strategic Roadmap & SWOT Analysis</h2>
        <p className="section-subtitle">
          A systematically phased approach to minimize risk and maximize learning velocity. 
          This roadmap balances speed-to-market with sustainable growth foundations.
        </p>
      </div>

      {/* Implementation Timeline */}
      <div className="mb-16">
        <div className="mb-8">
          <h3 className="text-xl font-bold text-slate-800 mb-2">Implementation Timeline</h3>
          <p className="text-slate-600">Structured development phases with clear milestones and success criteria</p>
        </div>
        <div className="overflow-x-auto pb-6">
          <div className="flex min-w-max space-x-8">
            <div className="w-80 flex-shrink-0 fade-in-up">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-black px-3 py-1 rounded-full text-xs font-bold mr-3">
                  PHASE 1
                </div>
                <span className="text-sm font-semibold text-slate-600">Months 1-3</span>
              </div>
              <div className="timeline-card">
                <h4 className="font-bold text-slate-800 mb-3 text-lg">Foundation & MVP</h4>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-slate-600">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span>Design system & user experience architecture</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span>Plaid sandbox integration & API testing</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span>Core dashboard functionality</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span>Internal testing & iteration cycles</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-xs font-medium text-blue-600">Success Metric: Working prototype</span>
                </div>
              </div>
            </div>
            
            <div className="w-80 flex-shrink-0 fade-in-up">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-black px-3 py-1 rounded-full text-xs font-bold mr-3">
                  PHASE 2
                </div>
                <span className="text-sm font-semibold text-slate-600">Months 4-6</span>
              </div>
              <div className="timeline-card border-l-cyan-500">
                <h4 className="font-bold text-slate-800 mb-3 text-lg">Validation & Optimization</h4>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-slate-600">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span>Private beta with 50+ selected users</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span>AI categorization accuracy validation</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span>Performance optimization & bug fixes</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span>Security audit & compliance review</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-xs font-medium text-cyan-600">Success Metric: 85%+ user satisfaction</span>
                </div>
              </div>
            </div>

            <div className="w-80 flex-shrink-0 fade-in-up">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-black px-3 py-1 rounded-full text-xs font-bold mr-3">
                  PHASE 3
                </div>
                <span className="text-sm font-semibold text-slate-600">Months 7-12</span>
              </div>
              <div className="timeline-card border-l-emerald-500">
                <h4 className="font-bold text-slate-800 mb-3 text-lg">Scale & Monetization</h4>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-slate-600">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span>Public launch with Pro tier pricing</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span>Growth marketing & user acquisition</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span>Advanced features & integrations</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span>Mobile application development</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-xs font-medium text-emerald-600">Success Metric: $50K+ MRR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive SWOT */}
      <h3 className="text-xl font-bold text-gray-800 mb-4">SWOT Analysis (Click to Explore)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projectData.swot.map((item, index) => (
          <div 
            key={index}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition"
            onClick={() => handleSwotClick(item)}
          >
            <div className="flex items-center mb-2">
              <span className={`w-3 h-3 rounded-full mr-2 ${getSwotColor(item.type)}`}></span>
              <h4 className="font-bold capitalize text-gray-800">{item.type}</h4>
            </div>
            <h5 className="text-lg font-semibold text-gray-700 mb-1">{item.title}</h5>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoadmapView;