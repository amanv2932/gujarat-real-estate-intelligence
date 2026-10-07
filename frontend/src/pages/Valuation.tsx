import { useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/Misc';
import { SectionCard, StatCard } from '../components/ui/Cards';
import { IndianRupee, CheckCircle, Brain, Info, AlertTriangle, TrendingDown, TrendingUp, Minus, Loader2 } from 'lucide-react';
import { getDevelopmentLocation } from '../services/api';

export default function Valuation() {
  const location = useLocation();
  const state = location.state as any;
  const [devInfo, setDevInfo] = useState<any>(null);
  const [devLoading, setDevLoading] = useState(false);
  const [devError, setDevError] = useState(false);

  useEffect(() => {
    if (state?.propertyDetails?.locality) {
      setDevLoading(true);
      getDevelopmentLocation(state.propertyDetails.locality)
        .then(res => setDevInfo(res))
        .catch(() => setDevError(true))
        .finally(() => setDevLoading(false));
    }
  }, [state]);

  if (!state || !state.prediction) {
    return <Navigate to="/analyzer" replace />;
  }

  const { prediction } = state;
  const estimatedMarketValue = prediction.estimated_market_value_lakh * 100000;
  const askingPrice = prediction.asking_price_lakh * 100000;
  const priceDifference = prediction.price_difference_lakh * 100000;

  // Determine status color/icon dynamically
  let StatusIcon = Minus;
  let statusColor = "text-slate-600";
  let statusBg = "bg-slate-50";

  if (prediction.deal_status === "Underpriced") {
    StatusIcon = TrendingDown;
    statusColor = "text-emerald-700";
    statusBg = "bg-emerald-50 border-emerald-200";
  } else if (prediction.deal_status === "Overpriced") {
    StatusIcon = TrendingUp;
    statusColor = "text-rose-700";
    statusBg = "bg-rose-50 border-rose-200";
  } else {
    StatusIcon = CheckCircle;
    statusColor = "text-blue-700";
    statusBg = "bg-blue-50 border-blue-200";
  }

  const sign = prediction.price_difference_lakh > 0 ? "+" : "";

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Property Valuation Results" 
        subtitle="AI-driven price estimation for the selected property." 
      />

      <div className="bg-slate-50 border border-slate-200 rounded-md p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-slate-600">
          <p className="font-medium mb-1">Disclaimer</p>
          <p>Deal analysis is based on the ML market-value estimate and defined business rules. It is not a guaranteed market valuation or investment recommendation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Estimated Market Value" 
          icon={IndianRupee} 
          value={`₹${(estimatedMarketValue / 100000).toFixed(2)} Lakh`} 
        />
        <StatCard 
          title="Asking Price" 
          icon={IndianRupee} 
          value={`₹${(askingPrice / 100000).toFixed(2)} Lakh`} 
        />
        <StatCard 
          title="Estimated Price / Sq.Ft." 
          icon={IndianRupee} 
          value={`₹${prediction.estimated_price_per_sqft.toLocaleString()}`} 
        />
        <StatCard 
          title="Model Used" 
          icon={Brain} 
          value={prediction.model_name} 
        />
      </div>

      <SectionCard title="Deal Intelligence">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard 
            title="Difference" 
            icon={AlertTriangle} 
            value={`${sign}₹${(priceDifference / 100000).toFixed(2)} L (${sign}${prediction.price_difference_percent.toFixed(2)}%)`} 
          />
          <div className={`border rounded-lg shadow-sm p-6 flex flex-col justify-center ${statusBg}`}>
            <div className="flex items-center justify-between mb-2">
               <h3 className={`text-sm font-medium ${statusColor}`}>Deal Status</h3>
               <StatusIcon className={`h-5 w-5 ${statusColor}`} />
            </div>
            <div className={`text-2xl font-bold ${statusColor}`}>{prediction.deal_status}</div>
          </div>
          <StatCard 
            title="Deal Score" 
            icon={CheckCircle} 
            value={`${prediction.deal_score} / 100`} 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 p-4 rounded-md">
            <h4 className="text-sm font-medium text-slate-500 mb-2">Indicative Negotiation Range</h4>
            <p className="text-lg font-semibold text-slate-900">
               ₹{prediction.negotiation_range_low_lakh.toFixed(2)}L – ₹{prediction.negotiation_range_high_lakh.toFixed(2)}L
            </p>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-md">
            <h4 className="text-sm font-medium text-slate-500 mb-2">Explanation</h4>
            <p className="text-base text-slate-800">
               {prediction.explanation}
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Property Details">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
          <div>
            <span className="block font-medium text-slate-900">City</span>
            {state.propertyDetails.city}
          </div>
          <div>
            <span className="block font-medium text-slate-900">Locality</span>
            {state.propertyDetails.locality}
          </div>
          <div>
            <span className="block font-medium text-slate-900">Property Type</span>
            {state.propertyDetails.property_type}
          </div>
          <div>
            <span className="block font-medium text-slate-900">Area</span>
            {state.propertyDetails.area_sqft} Sq.Ft.
          </div>
        </div>
      </SectionCard>

      {/* Development Intelligence Section */}
      {devLoading ? (
        <div className="flex justify-center p-6"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : devError ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">Error loading development data.</div>
      ) : devInfo ? (
        <SectionCard title="Locality Development Intelligence">
          {devInfo.matching_rera_projects.length === 0 && devInfo.matching_tp_schemes.length === 0 ? (
            <p className="text-slate-600 italic">{devInfo.message || "No reliable development record found."}</p>
          ) : (
            <div className="space-y-4">
               {devInfo.development_signals.map((sig: any, idx: number) => (
                 <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-md">
                   <div className="flex justify-between items-center mb-2">
                     <h4 className="font-semibold text-slate-800">Development Activity: {sig.signal_strength}</h4>
                   </div>
                   <div className="text-sm text-slate-600 space-y-2">
                     <p className="font-medium text-slate-800">Evidence:</p>
                     <ul className="list-disc pl-5">
                       <li>{devInfo.matching_rera_projects.length} RERA projects</li>
                       <li>{devInfo.matching_tp_schemes.length} relevant TP schemes</li>
                     </ul>
                     <p className="font-medium text-slate-800 mt-2">Interpretation:</p>
                     <p>Multiple development/planning records were found for this locality.</p>
                   </div>
                 </div>
               ))}
            </div>
          )}
        </SectionCard>
      ) : null}

      <div className="flex justify-end pt-4 border-t border-slate-200">
        <button
          onClick={() => {
            window.location.href = `/investment-intelligence?prop_val=${(estimatedMarketValue / 100000).toFixed(2)}`;
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
        >
          Analyze Investment
        </button>
      </div>
    </div>
  );
}
