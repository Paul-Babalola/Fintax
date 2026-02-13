import React, { useState, useEffect } from 'react';
import FinTaxSidebar from './FinTaxSidebar';
import FinTaxContent from './FinTaxContent';

export type FinTaxViewType = 'executive' | 'market' | 'tech' | 'business' | 'roadmap' | 'budget';

// Project data store
export const projectData = {
  scores: {
    relevance: 9,
    actionability: 8.5,
    complexity: 7,
    marketNeed: 9,
    competition: 6
  },
  marketComparison: {
    us: { users: 57, label: "Freelancers (M)", growth: 15 },
    ng: { users: 17, label: "SMEs (M)", growth: 25 }
  },
  techStack: [
    { layer: "Frontend", tools: "React/Vue + Tailwind", icon: "💻" },
    { layer: "Backend", tools: "Node.js / Python (Django)", icon: "⚙️" },
    { layer: "Bank APIs", tools: "Plaid (US) / Mono or Okra (NG)", icon: "🔗" },
    { layer: "Database", tools: "PostgreSQL (Transactions)", icon: "🗄️" },
    { layer: "Security", tools: "OAuth2, AES-256, PCI-DSS", icon: "🔒" }
  ],
  swot: [
    { type: 'strength', title: 'Niche Focus', desc: 'Specific focus on Tax-deductible expense tracking vs general budgeting.' },
    { type: 'weakness', title: 'Trust Barrier', desc: 'New fintechs face high skepticism regarding data security.' },
    { type: 'opportunity', title: 'Gig Economy', desc: 'Exploding freelaboth US and Nigeria needs tax automation.' },
    { type: 'threat', title: 'Regulatory Shift', desc: 'Changing Open Banking regulations (GDPR/NDPR) and tax codes.' }
  ]
};

const FinTaxDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<FinTaxViewType>('executive');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleViewChange = (view: FinTaxViewType) => {
    setActiveView(view);
    
    // Close mobile menu
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    // Initialize with executive view
    setActiveView('executive');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 font-inter antialiased">
      
      {/* Mobile Header */}
      <header className="lg:hidden bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">FT</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            FinTax Insight
          </h1>
        </div>
        <button 
          onClick={toggleSidebar}
          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors duration-200 flex items-center justify-center"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600">
            <line x1="4" x2="20" y1="6" y2="6"/>
            <line x1="4" x2="20" y1="12" y2="12"/>
            <line x1="4" x2="20" y1="18" y2="18"/>
          </svg>
        </button>
      </header>

      <div className="flex flex-1 lg:flex-row flex-col relative">
        {/* Sidebar Navigation */}
        <FinTaxSidebar
          activeView={activeView}
          onViewChange={handleViewChange}
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-0 min-h-screen relative">
          {/* Overlay for mobile sidebar */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
              onClick={closeSidebar}
            />
          )}
          
          <div className="px-4 py-6 lg:px-8 lg:py-10 max-w-7xl mx-auto">
            <FinTaxContent activeView={activeView} onViewChange={handleViewChange} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default FinTaxDashboard;