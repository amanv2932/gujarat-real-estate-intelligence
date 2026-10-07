import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/ui/Misc';
import { SectionCard } from '../components/ui/Cards';
import { Loader2, Activity, Info } from 'lucide-react';
import { investmentAnalysis } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';

export default function InvestmentIntelligence() {
  const [searchParams] = useSearchParams();
  const initialPropVal = searchParams.get('prop_val') ? searchParams.get('prop_val') as string : '50';

  const [form, setForm] = useState({
    property_value_lakh: initialPropVal,
    monthly_rent: '',
    annual_rent: '',
    holding_period_years: '5',
    expected_annual_appreciation_percent: '5',
    annual_expense_percent: '10',
    transaction_cost_percent: '6'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        property_value_lakh: Number(form.property_value_lakh),
        monthly_rent: form.monthly_rent !== '' ? Number(form.monthly_rent) : null,
        annual_rent: form.annual_rent !== '' ? Number(form.annual_rent) : null,
        holding_period_years: Number(form.holding_period_years),
        expected_annual_appreciation_percent: form.expected_annual_appreciation_percent !== '' ? Number(form.expected_annual_appreciation_percent) : null,
        annual_expense_percent: form.annual_expense_percent !== '' ? Number(form.annual_expense_percent) : null,
        transaction_cost_percent: form.transaction_cost_percent !== '' ? Number(form.transaction_cost_percent) : null
      };

      const data = await investmentAnalysis(payload);
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Failed to analyze investment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chartData = result && result.future_value_base_lakh ? [
    {
      name: 'Current Value',
      Value: result.current_property_value_lakh,
    },
    {
      name: 'Conservative',
      Value: result.future_value_conservative_lakh,
    },
    {
      name: 'Base Scenario',
      Value: result.future_value_base_lakh,
    },
    {
      name: 'Optimistic',
      Value: result.future_value_optimistic_lakh,
    }
  ] : [];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Investment Intelligence" 
        subtitle="Evaluate rental income, return scenarios and investment assumptions." 
      />

      <div className="bg-slate-50 border border-slate-200 rounded-md p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-slate-600">
          <p className="font-medium mb-1">Disclaimer</p>
          <p>This module provides scenario-based analytical estimates and is not financial advice or a guarantee of investment returns. Adjust the illustrative assumptions below to see different scenarios.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-1 space-y-6">
          <SectionCard title="Investment Assumptions">
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Property Value (₹ Lakh)</label>
                <input 
                  type="number" 
                  value={form.property_value_lakh} 
                  onChange={(e) => setForm({...form, property_value_lakh: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Rent (₹)</label>
                  <input 
                    type="number" 
                    value={form.monthly_rent} 
                    onChange={(e) => setForm({...form, monthly_rent: e.target.value})}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Annual Rent (₹)</label>
                  <input 
                    type="number" 
                    value={form.annual_rent} 
                    onChange={(e) => setForm({...form, annual_rent: e.target.value})}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Holding (Years)</label>
                  <input 
                    type="number" 
                    value={form.holding_period_years} 
                    onChange={(e) => setForm({...form, holding_period_years: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Appreciation (%)</label>
                  <input 
                    type="number" 
                    value={form.expected_annual_appreciation_percent} 
                    onChange={(e) => setForm({...form, expected_annual_appreciation_percent: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Expenses (%)</label>
                  <input 
                    type="number" 
                    value={form.annual_expense_percent} 
                    onChange={(e) => setForm({...form, annual_expense_percent: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Txn Cost (%)</label>
                  <input 
                    type="number" 
                    value={form.transaction_cost_percent} 
                    onChange={(e) => setForm({...form, transaction_cost_percent: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
              </div>

              <button 
                onClick={handleCalculate}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex justify-center items-center"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Calculate Scenarios"}
              </button>
            </div>
          </SectionCard>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
              {error}
            </div>
          )}

          {result?.warnings && result.warnings.length > 0 && (
            <div className="p-4 bg-amber-50 text-amber-800 rounded-md border border-amber-200 space-y-2">
              <p className="font-semibold text-sm">Data Limitations</p>
              <ul className="list-disc pl-4 text-sm">
                {result.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}
        </div>

        {/* Results Section */}
        {result && !loading && (
          <div className="lg:col-span-2 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rental Analysis Card */}
              <SectionCard title="Rental Yield Analysis">
                <div className="mt-4 space-y-4">
                  {result.gross_rental_yield_percent ? (
                    <>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-slate-600">Annual Rent</span>
                        <span className="font-semibold">₹{result.annual_rent_lakh?.toFixed(2)} Lakh</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-slate-600">Gross Rental Yield</span>
                        <span className="font-semibold text-emerald-600">{result.gross_rental_yield_percent?.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Net Rental Yield</span>
                        <span className="font-semibold text-emerald-600">
                          {result.net_rental_yield_percent ? `${result.net_rental_yield_percent?.toFixed(2)}%` : "N/A"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="py-6 text-center text-slate-500 italic">
                      No rental data supplied
                    </div>
                  )}
                </div>
              </SectionCard>

              {/* ROI Summary */}
              <SectionCard title="Return on Investment Estimate">
                <div className="mt-4 space-y-4">
                  {result.estimated_total_return_lakh ? (
                    <>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-slate-600">Total Capital Generated</span>
                        <span className="font-semibold">₹{(result.future_value_base_lakh + (result.cumulative_rent_lakh || 0)).toFixed(2)} Lakh</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-slate-600">Total Costs (Incl. Txn)</span>
                        <span className="font-semibold">₹{(result.current_property_value_lakh + (result.transaction_cost_lakh || 0)).toFixed(2)} Lakh</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-slate-600">Net Estimated Return</span>
                        <span className="font-semibold text-emerald-600">₹{result.estimated_total_return_lakh?.toFixed(2)} Lakh</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Estimated ROI</span>
                        <span className="font-semibold text-emerald-600">{result.estimated_roi_percent?.toFixed(2)}%</span>
                      </div>
                    </>
                  ) : (
                    <div className="py-6 text-center text-slate-500 italic">
                      Insufficient data for ROI
                    </div>
                  )}
                </div>
              </SectionCard>
            </div>

            {/* Future Value Chart */}
            <SectionCard title="Future Value Scenarios">
              <p className="text-xs text-slate-500 mb-4">Scenario — not a forecast guarantee</p>
              {chartData.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(v) => `₹${v}L`} />
                      <RechartsTooltip formatter={(val: any) => [`₹${Number(val).toFixed(2)} Lakh`, 'Value']} />
                      <Bar dataKey="Value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="py-10 text-center text-slate-500 italic">
                  Appreciation percentage required to chart future value scenarios.
                </div>
              )}
            </SectionCard>

            {/* Investment Score */}
            {result.investment_score !== null && (
              <SectionCard title="Investment Score">
                <div className="flex flex-col md:flex-row gap-6 mt-4">
                  <div className="flex-shrink-0 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-4xl font-bold text-blue-700 mb-2">{result.investment_score}</div>
                    <div className="text-sm font-medium text-slate-600">{result.investment_category}</div>
                    <p className="text-xs text-slate-500 text-center mt-2 max-w-[150px]">
                      This score is a rule-based analytical indicator, not financial advice.
                    </p>
                  </div>
                  <div className="flex-grow space-y-3">
                    <h4 className="font-medium text-slate-800">Supporting Factors</h4>
                    {result.factors.map((f: any, idx: number) => (
                      <div key={idx} className="flex gap-3 p-3 bg-white border border-slate-100 rounded-md shadow-sm">
                        <Activity className={`w-5 h-5 flex-shrink-0 ${
                          f.impact === 'Positive' ? 'text-emerald-500' : 
                          f.impact === 'Negative' ? 'text-rose-500' : 'text-slate-400'
                        }`} />
                        <div>
                          <p className="font-semibold text-sm text-slate-800">{f.factor}</p>
                          <p className="text-sm text-slate-600">{f.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
