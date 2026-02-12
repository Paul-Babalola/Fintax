import React from 'react';
import type { FinTaxViewType } from './FinTaxDashboard';
import ExecutiveSummaryView from './views/ExecutiveSummaryView';
import MarketAnalysisView from './views/MarketAnalysisView';
import TechStrategyView from './views/TechStrategyView';
import BusinessModelView from './views/BusinessModelView';
import RoadmapView from './views/RoadmapView';

interface FinTaxContentProps {
  activeView: FinTaxViewType;
  onViewChange: (view: FinTaxViewType) => void;
}

const FinTaxContent: React.FC<FinTaxContentProps> = ({ activeView, onViewChange }) => {
  const renderContent = () => {
    switch (activeView) {
      case 'executive':
        return <ExecutiveSummaryView onViewChange={onViewChange} />;
      case 'market':
        return <MarketAnalysisView />;
      case 'tech':
        return <TechStrategyView />;
      case 'business':
        return <BusinessModelView />;
      case 'roadmap':
        return <RoadmapView />;
      default:
        return <ExecutiveSummaryView onViewChange={onViewChange} />;
    }
  };

  return (
    <div 
      className="fintax-content"
      style={{
        opacity: 1,
        transition: 'opacity 0.3s ease-in'
      }}
    >
      {renderContent()}
    </div>
  );
};

export default FinTaxContent;