import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/ui/Misc';
import { SectionCard, StatCard } from '../components/ui/Cards';
import { 
  Loader2, Home, IndianRupee, MapPin, BarChart2, Activity,
  TrendingUp, Database, Brain, ArrowRight, Cpu
} from 'lucide-react';
import { getMarketOverview, getMarketCities } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [marketOverview, setMarketOverview] = useState<any>(null);
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mOverview, mCities] = await Promise.all([
          getMarketOverview(),
          getMarketCities()
        ]);
        setMarketOverview(mOverview);
        setCities(mCities);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-600">Loading intelligence dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-md border border-red-200">
        <h3 className="font-semibold text-lg mb-2">Error Loading Data</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Gujarat Real Estate Intelligence" 
        subtitle="Machine learning based property valuation and real estate analysis for Gujarat." 
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Properties" 
          icon={Home} 
          value={marketOverview?.total_properties?.toLocaleString() || 'N/A'} 
        />
        <StatCard 
          title="Average Property Price" 
          icon={IndianRupee} 
          value={marketOverview?.average_price_lakh ? `₹${marketOverview.average_price_lakh.toLocaleString()} L` : 'N/A'} 
        />
        <StatCard 
          title="Average Price / Sq.Ft" 
          icon={MapPin} 
          value={marketOverview?.average_price_per_sqft ? `₹${marketOverview.average_price_per_sqft.toLocaleString()}` : 'N/A'} 
        />
      </div>

      {/* Quick Access */}
      <SectionCard title="Explore Modules">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mt-4">
          
          <div 
            onClick={() => navigate('/property-analyzer')}
            className="flex flex-col items-center p-6 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-md cursor-pointer transition-all"
          >
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-3">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1 text-center">Property Valuation</h3>
            <p className="text-xs text-slate-500 text-center mb-4">ML-driven price estimation and deal intelligence.</p>
            <button className="text-sm font-medium text-blue-600 flex items-center">Open <ArrowRight className="w-4 h-4 ml-1" /></button>
          </div>

          <div 
            onClick={() => navigate('/market-intelligence')}
            className="flex flex-col items-center p-6 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-md cursor-pointer transition-all"
          >
            <div className="p-3 bg-purple-50 text-purple-600 rounded-full mb-3">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1 text-center">Market Intelligence</h3>
            <p className="text-xs text-slate-500 text-center mb-4">Aggregate pricing, trends, and supply distributions.</p>
            <button className="text-sm font-medium text-purple-600 flex items-center">Open <ArrowRight className="w-4 h-4 ml-1" /></button>
          </div>

          <div 
            onClick={() => navigate('/investment-intelligence')}
            className="flex flex-col items-center p-6 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-md cursor-pointer transition-all"
          >
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full mb-3">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1 text-center">Investment Intelligence</h3>
            <p className="text-xs text-slate-500 text-center mb-4">Model rental yields, ROI, and scenario projections.</p>
            <button className="text-sm font-medium text-emerald-600 flex items-center">Open <ArrowRight className="w-4 h-4 ml-1" /></button>
          </div>

        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ML Model Section */}
        <SectionCard title="Machine Learning Model">
          <div className="mt-4 flex flex-col justify-center space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-slate-100 rounded-full text-slate-700">
                <Cpu className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-semibold text-lg text-slate-800">Gradient Boosting Regressor</h4>
                <p className="text-sm text-slate-600">
                  Estimates property market value using property characteristics and development-related features.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-md text-center">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Holdout R² Score</p>
                <p className="text-2xl font-bold text-slate-800">0.773</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-md text-center">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Mean Absolute Error (Lakh)</p>
                <p className="text-2xl font-bold text-slate-800">5.11</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-md text-center">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">RMSE (Lakh)</p>
                <p className="text-2xl font-bold text-slate-800">6.94</p>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Investment Snapshot */}
        <SectionCard title="Investment Intelligence">
          <div className="mt-4 h-full flex flex-col justify-center">
            <p className="text-sm text-slate-600 mb-4">
              Analyze a property using user-provided investment assumptions to generate scenario-based returns.
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center text-sm font-medium text-slate-700">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span> Rental Yield Analysis
              </li>
              <li className="flex items-center text-sm font-medium text-slate-700">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span> Future Value Scenarios
              </li>
              <li className="flex items-center text-sm font-medium text-slate-700">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span> Return on Investment (ROI)
              </li>
              <li className="flex items-center text-sm font-medium text-slate-700">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span> Rule-based Investment Score
              </li>
            </ul>
            <button 
              onClick={() => navigate('/investment-intelligence')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition-colors w-fit"
            >
              Analyze Investment
            </button>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Market Snapshot */}
        <SectionCard title="Market Snapshot (Average Price / Sq.Ft)">
          <div style={{ height: `${Math.max(250, cities.length * 35)}px` }} className="w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cities} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="city" type="category" width={100} tick={{ fontSize: 12 }} interval={0} />
                <RechartsTooltip cursor={{ fill: '#f1f5f9' }} formatter={(val) => `₹${val}`} />
                <Bar dataKey="average_price_per_sqft" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-end mt-4">
            <button 
              onClick={() => navigate('/market-intelligence')}
              className="text-sm font-medium text-purple-600 flex items-center hover:underline"
            >
              View Market Intelligence <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </SectionCard>

      </div>

      {/* How it Works */}
      <SectionCard title="How It Works">
        <div className="flex flex-col md:flex-row justify-between items-center mt-6 mb-4 gap-4 md:gap-0 relative">
           
           <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-slate-200 -z-10"></div>
           
           <div className="flex flex-col items-center bg-white">
             <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center border border-slate-300 mb-3 z-10">
               <Database className="w-6 h-6 text-slate-600" />
             </div>
             <span className="text-sm font-medium text-slate-800 text-center">Property Data</span>
           </div>

           <div className="flex flex-col items-center bg-white">
             <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center border border-blue-300 mb-3 z-10">
               <Brain className="w-6 h-6 text-blue-600" />
             </div>
             <span className="text-sm font-medium text-slate-800 text-center">Machine Learning Valuation</span>
           </div>

           <div className="flex flex-col items-center bg-white">
             <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center border border-purple-300 mb-3 z-10">
               <Activity className="w-6 h-6 text-purple-600" />
             </div>
             <span className="text-sm font-medium text-slate-800 text-center">Market & Development Analysis</span>
           </div>

           <div className="flex flex-col items-center bg-white">
             <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center border border-emerald-300 mb-3 z-10">
               <TrendingUp className="w-6 h-6 text-emerald-600" />
             </div>
             <span className="text-sm font-medium text-slate-800 text-center">Real Estate Intelligence</span>
           </div>
        </div>
      </SectionCard>

      {/* Disclaimer */}
      <div className="text-center pb-8">
        <p className="text-xs text-slate-500 italic">
          This college project provides analytical estimates based on the available dataset and user-provided assumptions. Results are not guaranteed market values, investment returns, or financial advice.
        </p>
      </div>

    </div>
  );
}
