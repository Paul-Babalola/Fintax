import React from 'react';
import type { FinTaxViewType } from './FinTaxDashboard';

interface FinTaxSidebarProps {
  activeView: FinTaxViewType;
  onViewChange: (view: FinTaxViewType) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: FinTaxViewType;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { id: 'executive', label: 'Executive Summary', icon: '📊' },
  { id: 'market', label: 'Market Analysis', icon: '🌍' },
  { id: 'tech', label: 'Technical Strategy', icon: '⚙️' },
  { id: 'business', label: 'Business Model', icon: '💰' },
  { id: 'budget', label: 'Budget Management', icon: '📈' },
  { id: 'roadmap', label: 'Roadmap & SWOT', icon: '🚀' },
];

const FinTaxSidebar: React.FC<FinTaxSidebarProps> = ({ 
  activeView, 
  onViewChange, 
  isOpen
}) => {
  return (
    <nav className={`
      w-80 lg:w-72 xl:w-80 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 
      flex-shrink-0 fixed lg:relative h-full z-50 transform transition-all duration-300 ease-out
      shadow-xl lg:shadow-none
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Header */}
      <div className="p-6 lg:p-8 border-b border-slate-200/60">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-blue-300 font-bold text-lg">FT</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight">
              FinTax Insight
            </h1>
            <p className="text-xs text-slate-500 font-medium">Project Feasibility Analysis</p>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-transparent"></div>
      </div>
      
      {/* Navigation */}
      <div className="flex-grow overflow-y-auto px-4 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onViewChange(item.id)}
                className={`
                  w-full text-left px-4 py-3 rounded-xl flex items-center group transition-all duration-200
                  ${activeView === item.id 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-blue-500 shadow-lg shadow-blue-500/25' 
                    : 'hover:bg-slate-100/80 text-slate-700 hover:text-slate-900'
                  }
                `}
              >
                <span className={`mr-4 text-xl transition-all duration-200 ${
                  activeView === item.id ? 'scale-110 drop-shadow-sm' : 'group-hover:scale-105'
                }`}>
                  {item.icon}
                </span>
                <span className={`font-medium text-sm tracking-tight ${
                  activeView === item.id ? 'text-blue-500' : ''
                }`}>
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Status Footer */}
      <div className="p-6 border-t border-slate-200/60">
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-xl border border-emerald-200/50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-800">Project Viability</h3>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-emerald-700">Live</span>
            </div>
          </div>
          <div className="mb-3">
            <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: '85%' }}
              />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-slate-600">Actionability Score</span>
            <div className="flex items-center space-x-1">
              <span className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                High
              </span>
              <span className="text-xs text-slate-500">(85%)</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default FinTaxSidebar;