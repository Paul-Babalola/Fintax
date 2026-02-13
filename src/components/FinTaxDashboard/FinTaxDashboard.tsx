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
    <div className="fintax-dashboard h-screen overflow-hidden flex flex-col md:flex-row" 
         style={{ 
           fontFamily: "'Inter', sans-serif",
           backgroundColor: '#f3f4f6',
           color: '#1f2937'
         }}>
      
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center z-20">
        <h1 className="text-xl font-bold text-teal-800">FinTax Insight</h1>
        <button 
          onClick={toggleSidebar}
          className="text-gray-600 focus:outline-none text-2xl"
        >
          &#9776;
        </button>
      </header>

      {/* Sidebar Navigation */}
      <FinTaxSidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto bg-gray-50 relative w-full fintax-scroll">
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-50 z-0 md:hidden"
            onClick={closeSidebar}
          />
        )}
        
        <div className="max-w-7xl mx-auto p-4 md:p-8 pb-20">
          <FinTaxContent activeView={activeView} onViewChange={handleViewChange} />
        </div>
      </main>
    </div>
  );
};

export default FinTaxDashboard;