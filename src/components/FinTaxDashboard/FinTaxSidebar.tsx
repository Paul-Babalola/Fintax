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
  const baseClasses = "bg-white w-full md:w-64 border-r border-gray-200 flex-shrink-0 absolute md:relative h-full z-10 transform transition-transform duration-300 ease-in-out flex flex-col";
  const mobileClasses = isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0";

  return (
    <nav className={`${baseClasses} ${mobileClasses} bg-white/95 backdrop-blur-lg border-r border-slate-200/50`}>
      <div className="p-8 hidden md:block border-b border-slate-100/80">
        <div className="mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight">
            FinTax Insight
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Project Feasibility Analysis</p>
        </div>
        <div className="h-px bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-transparent"></div>
      </div>
      
      <div className="flex-grow overflow-y-auto fintax-scroll py-6">
        <ul className="space-y-2 px-3">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onViewChange(item.id)}
                className={`sidebar-nav-item w-full text-left px-4 py-3.5 flex items-center group ${
                  activeView === item.id ? 'active' : ''
                }`}
              >
                <span className={`mr-3 text-lg transition-transform group-hover:scale-110 ${
                  activeView === item.id ? 'filter drop-shadow-sm' : ''
                }`}>
                  {item.icon}
                </span>
                <span className="font-medium text-sm tracking-wide">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-6 border-t border-slate-100/80">
        <div className="status-indicator">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Actionability Score</h3>
          <div className="status-progress mb-3">
            <div className="status-progress-bar" style={{ width: '85%' }} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-slate-600">Project Viability</span>
            <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              High (85%)
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default FinTaxSidebar;