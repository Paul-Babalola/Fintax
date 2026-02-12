import React from 'react';
import { projectData } from '../FinTaxDashboard';

const TechStrategyView: React.FC = () => {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Technical Architecture</h2>
        <p className="text-gray-600 max-w-3xl">
          As a frontend developer, your strength is the UI, but the "Magic" happens in the secure backend handling banking tokens. 
          Below is the recommended stack to ensure security and scalability without over-engineering.
        </p>
      </div>

      {/* Stack Visualization (No SVG/Mermaid) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10 text-center">
        {projectData.techStack.map((item, index) => (
          <div key={index} className="relative bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-teal-400 transition cursor-default">
            <div className="text-4xl mb-2">{item.icon}</div>
            <h4 className="font-bold text-gray-800 mb-1">{item.layer}</h4>
            <p className="text-xs text-gray-500">{item.tools}</p>
            {index < 4 && (
              <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 text-gray-300 z-10">➝</div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Key Challenge: Data Normalization</h3>
          <p className="text-sm text-gray-600 mb-4">
            Bank A says "Starbucks Coffee", Bank B says "TST*Starbucks 022". 
            You need a robust categorization engine.
          </p>
          <div className="bg-gray-800 text-gray-200 p-4 rounded-lg text-xs font-mono overflow-auto">
            <div>// Logic Pseudocode</div>
            <div>const transaction = await BankAPI.getTrans();</div>
            <div>const category = TaxEngine.classify(transaction.merchant);</div>
            <div>if (category.isDeductible) {`{`}</div>
            <div>&nbsp;&nbsp;TaxSavings.add(transaction.amount * taxRate);</div>
            <div>{`}`}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Security Requirements (Non-Negotiable)</h3>
          <ul className="space-y-3">
            <li className="flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              <strong>Tokenization:</strong> Never store bank credentials (username/pw). Only store access tokens provided by Plaid/Mono.
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              <strong>Encryption:</strong> AES-256 for any PII (Personal Identifiable Information) in your DB.
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              <strong>Compliance:</strong> GDPR (for EU/Global citizens) and NDPR (Nigeria Data Protection Regulation).
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TechStrategyView;