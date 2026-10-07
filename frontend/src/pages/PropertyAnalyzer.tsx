import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, FormSection } from '../components/ui/Misc';
import { SectionCard } from '../components/ui/Cards';
import { PrimaryButton } from '../components/ui/Buttons';
import { getFilters, analyzeDeal } from '../services/api';
import { Loader2 } from 'lucide-react';

export default function PropertyAnalyzer() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    city: '',
    locality: '',
    property_type: '',
    area_sqft: '',
    bhk: '',
    bathrooms: '',
    floor_current: '',
    total_floors: '',
    age_years: '',
    furnishing: '',
    facing: '',
    transaction_type: '',
    asking_price_lakh: '',
    // Advanced defaults (if not shown, hidden from UI)
    lift_available: '1',
    status: 'Ready to Move',
    jantri_rate_per_sqft: '5000',
    development_score: '7.5',
    rera_project_match: '1',
    development_potential: 'High',
    tp_scheme: 'Approved'
  });

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const data = await getFilters();
        setFilters(data);
      } catch (err) {
        console.error("Failed to load filters", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFilters();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Validate and parse
      const payload = {
        city: formData.city,
        locality: formData.locality,
        property_type: formData.property_type,
        area_sqft: parseFloat(formData.area_sqft),
        bhk: parseInt(formData.bhk),
        bathrooms: parseInt(formData.bathrooms),
        floor_current: parseInt(formData.floor_current),
        total_floors: parseInt(formData.total_floors),
        age_years: parseInt(formData.age_years),
        furnishing: formData.furnishing,
        facing: formData.facing,
        transaction_type: formData.transaction_type,
        asking_price_lakh: parseFloat(formData.asking_price_lakh),
        lift_available: parseInt(formData.lift_available),
        status: formData.status,
        jantri_rate_per_sqft: parseFloat(formData.jantri_rate_per_sqft),
        development_score: parseFloat(formData.development_score),
        rera_project_match: parseInt(formData.rera_project_match),
        development_potential: formData.development_potential,
        tp_scheme: formData.tp_scheme
      };

      if (payload.area_sqft <= 0) throw new Error("Area must be greater than 0");
      if (payload.bhk < 0) throw new Error("BHK cannot be negative");
      if (payload.bathrooms < 0) throw new Error("Bathrooms cannot be negative");
      if (payload.floor_current < 0 || payload.total_floors < 0) throw new Error("Floors cannot be negative");
      if (payload.floor_current > payload.total_floors) throw new Error("Current floor cannot exceed total floors");
      if (payload.age_years < 0) throw new Error("Age cannot be negative");
      if (payload.asking_price_lakh <= 0) throw new Error("Asking price must be positive");
      if (!payload.city || !payload.locality || !payload.property_type || !payload.furnishing || !payload.facing || !payload.transaction_type) {
         throw new Error("Please fill in all required location and property details");
      }

      const response = await analyzeDeal(payload);
      
      // Pass the response and original form to Valuation via state
      navigate('/valuation', { 
        state: { 
          prediction: response,
          propertyDetails: formData
        } 
      });
      
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError(err.message || "An unexpected error occurred.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Property Analyzer" 
        subtitle="Enter property details to analyze market standing and expected valuation." 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Property Information">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
            <form className="space-y-8" onSubmit={handleSubmit}>
              
              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
                  {error}
                </div>
              )}

              <FormSection title="Property Location">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                    <select name="city" value={formData.city} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-sm">
                      <option value="">Select City...</option>
                      {filters?.cities?.map((c: string) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Locality</label>
                    <select name="locality" value={formData.locality} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-sm">
                      <option value="">Select Locality...</option>
                      {filters?.localities?.map((l: string) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
              </FormSection>

              <FormSection title="Property Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Property Type</label>
                    <select name="property_type" value={formData.property_type} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-sm">
                      <option value="">Select Property Type...</option>
                      {filters?.property_types?.map((p: string) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Area (Sq.Ft.)</label>
                    <input name="area_sqft" type="number" min="1" step="any" required value={formData.area_sqft} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" placeholder="e.g. 1500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">BHK</label>
                    <select name="bhk" value={formData.bhk} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-sm">
                      <option value="">Select BHK...</option>
                      {filters?.bhk_options?.map((b: number) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Bathrooms</label>
                    <input name="bathrooms" type="number" min="0" required value={formData.bathrooms} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" placeholder="e.g. 2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Floor</label>
                    <input name="floor_current" type="number" min="0" required value={formData.floor_current} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" placeholder="e.g. 5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Total Floors</label>
                    <input name="total_floors" type="number" min="0" required value={formData.total_floors} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" placeholder="e.g. 10" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Property Age (Years)</label>
                    <input name="age_years" type="number" min="0" required value={formData.age_years} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" placeholder="e.g. 2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Furnishing</label>
                    <select name="furnishing" value={formData.furnishing} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-sm">
                      <option value="">Select...</option>
                      {filters?.furnishing_options?.map((f: string) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Facing</label>
                    <select name="facing" value={formData.facing} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-sm">
                      <option value="">Select...</option>
                      {filters?.facing_options?.map((f: string) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
              </FormSection>

              <FormSection title="Transaction Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Asking Price (Lakh ₹)</label>
                    <input name="asking_price_lakh" type="number" min="0.01" step="any" required value={formData.asking_price_lakh} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm" placeholder="e.g. 75" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Type</label>
                    <select name="transaction_type" value={formData.transaction_type} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-sm">
                      <option value="">New / Resale</option>
                      {filters?.transaction_types?.map((t: string) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </FormSection>

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <PrimaryButton type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Property'
                  )}
                </PrimaryButton>
              </div>
            </form>
            )}
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Analysis Guidelines" description="How to get accurate results">
            <ul className="text-sm text-slate-600 space-y-3 list-disc pl-4">
              <li>Ensure location details are as specific as possible.</li>
              <li>Provide accurate area measurements in square feet.</li>
              <li>Age of property significantly impacts valuation accuracy.</li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
