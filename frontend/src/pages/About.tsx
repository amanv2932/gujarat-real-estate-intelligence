import { PageHeader } from '../components/ui/Misc';
import { SectionCard } from '../components/ui/Cards';
import { Activity, Cpu } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader 
        title="About the Platform" 
        subtitle="Gujarat Real Estate Intelligence Platform" 
      />

      <div className="bg-blue-900 text-white p-8 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Empowering Real Estate Decisions</h2>
        <p className="text-blue-100 leading-relaxed mb-6">
          The Gujarat Real Estate Intelligence Platform is a comprehensive, B2B-focused analytical tool designed for property professionals, investors, and developers. It aggregates vast amounts of regional market data to provide actionable intelligence across multiple real estate verticals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard title="Property Valuation" className="h-full">
          <div className="flex items-start">
            <div className="p-2 bg-blue-100 rounded-lg mr-4 text-blue-700">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Utilizing advanced machine learning algorithms to provide accurate property valuations based on historical transaction data, locational advantages, and micro-market trends.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Market Intelligence" className="h-full">
          <div className="flex items-start">
            <div className="p-2 bg-blue-100 rounded-lg mr-4 text-blue-700">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Deep analytical insights into macro market trends, price appreciation metrics, and inventory distribution across major cities like Ahmedabad, Surat, Vadodara, and Rajkot.
              </p>
            </div>
          </div>
        </SectionCard>

      </div>

      {/* Tech Stack and Resources Section */}
      <SectionCard title="Technology Stack & Project Details" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-slate-600">
          <div>
            <h3 className="font-semibold text-slate-800 mb-3 border-b pb-2">Frontend Application</h3>
            <ul className="space-y-2">
              <li><span className="font-medium text-slate-700">Framework:</span> React (Vite) with TypeScript</li>
              <li><span className="font-medium text-slate-700">Styling:</span> Tailwind CSS</li>
              <li><span className="font-medium text-slate-700">Data Visualization:</span> Recharts</li>
              <li><span className="font-medium text-slate-700">Icons:</span> Lucide React</li>
              <li><span className="font-medium text-slate-700">Routing:</span> React Router DOM</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-800 mb-3 border-b pb-2">Backend & Machine Learning</h3>
            <ul className="space-y-2">
              <li><span className="font-medium text-slate-700">API Framework:</span> FastAPI (Python), Uvicorn</li>
              <li><span className="font-medium text-slate-700">Data Processing:</span> Pandas, NumPy</li>
              <li><span className="font-medium text-slate-700">ML Library:</span> Scikit-learn, Joblib</li>
              <li><span className="font-medium text-slate-700">Primary ML Model:</span> Gradient Boosting Regressor</li>
              <li><span className="font-medium text-slate-700">Core Dataset:</span> gujarat final.csv</li>
            </ul>
          </div>
        </div>
      </SectionCard>

      <div className="pt-8 text-center text-sm text-slate-500">
        <p>Gujarat Real Estate Intelligence Platform &copy; 2026. All rights reserved.</p>
        <p className="mt-1">Version 1.0.0 (Frontend Layout Preview)</p>
      </div>
    </div>
  );
}
