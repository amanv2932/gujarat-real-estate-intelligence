import { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/Misc';
import { SectionCard, StatCard } from '../components/ui/Cards';
import { Loader2, Home, MapPin, IndianRupee, PieChart } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import {
  getMarketOverview, getMarketLocalities,
  getMarketPropertyTypes, getMarketBhk, getMarketPriceDistribution, getMarketAreaPrice
} from '../services/api';

export default function MarketIntelligence() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [overview, setOverview] = useState<any>(null);
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [bhk, setBhk] = useState<any[]>([]);
  const [priceDist, setPriceDist] = useState<any[]>([]);
  const [areaPrice, setAreaPrice] = useState<any[]>([]);
  const [localities, setLocalities] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
          const [
          overviewData,
          propertyTypesData,
          bhkData,
          priceDistData,
          areaPriceData,
          localitiesData
        ] = await Promise.all([
          getMarketOverview(),
          getMarketPropertyTypes(),
          getMarketBhk(),
          getMarketPriceDistribution(),
          getMarketAreaPrice(),
          getMarketLocalities()
        ]);

        setOverview(overviewData);
        setPropertyTypes(propertyTypesData);
        setBhk(bhkData);
        setPriceDist(priceDistData);
        setAreaPrice(areaPriceData);
        setLocalities(localitiesData);
      } catch (err: any) {
        setError(err.message || "Failed to load market intelligence data.");
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
        <p className="text-slate-600">Analyzing market data...</p>
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
    <div className="space-y-6">
      <PageHeader 
        title="Market Intelligence" 
        subtitle="Explore Gujarat property pricing and market patterns using the available property dataset." 
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Properties" 
          icon={Home} 
          value={overview?.total_properties.toLocaleString()} 
        />
        <StatCard 
          title="Average Price" 
          icon={IndianRupee} 
          value={`₹${overview?.average_price_lakh.toLocaleString()} L`} 
        />
        <StatCard 
          title="Median Price" 
          icon={PieChart} 
          value={`₹${overview?.median_price_lakh.toLocaleString()} L`} 
        />
        <StatCard 
          title="Avg. Price / Sq.Ft." 
          icon={MapPin} 
          value={`₹${overview?.average_price_per_sqft.toLocaleString()}`} 
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Price Distribution */}
        <SectionCard title="Property Count by Price Range">
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceDist} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="bucket" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} interval={0} />
                <YAxis />
                <RechartsTooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="property_count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Type Analysis */}
        <SectionCard title="Property Type Analysis">
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-3">Property Type</th>
                  <th className="px-4 py-3 text-right">Properties</th>
                  <th className="px-4 py-3 text-right">Avg Price (Lakh)</th>
                  <th className="px-4 py-3 text-right">Avg Sq.Ft. Rate</th>
                </tr>
              </thead>
              <tbody>
                {propertyTypes.map((pt, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{pt.property_type}</td>
                    <td className="px-4 py-3 text-right">{pt.property_count.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">₹{pt.average_price_lakh.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">₹{pt.average_price_per_sqft.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* BHK Analysis */}
        <SectionCard title="BHK Analysis">
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bhk.filter(b => b.bhk > 0)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="bhk" tickFormatter={(val) => `${val} BHK`} interval={0} />
                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                <RechartsTooltip />
                <Bar yAxisId="left" dataKey="average_price_lakh" name="Avg Price (L)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="property_count" name="Count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area vs Price Scatter */}
        <SectionCard title="Area vs Price Relationship (Sampled)">
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="area_sqft" name="Area" unit=" sqft" domain={['auto', 'auto']} />
                <YAxis type="number" dataKey="price_lakh" name="Price" unit=" L" domain={['auto', 'auto']} />
                <ZAxis dataKey="city" name="City" />
                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Properties" data={areaPrice} fill="#8b5cf6" opacity={0.6}>
                  {areaPrice.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.city === 'Ahmedabad' ? '#3b82f6' : entry.city === 'Surat' ? '#10b981' : '#f59e0b'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Top Localities Table */}
        <SectionCard title="Top Localities (By Property Count)">
          <div className="overflow-auto h-[350px] relative mt-4">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3">Locality</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3 text-right">Properties</th>
                  <th className="px-4 py-3 text-right">Median Price (L)</th>
                  <th className="px-4 py-3 text-right">Avg Sq.Ft.</th>
                </tr>
              </thead>
              <tbody>
                {localities.slice(0, 50).map((loc, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{loc.locality}</td>
                    <td className="px-4 py-3 text-slate-600">{loc.city}</td>
                    <td className="px-4 py-3 text-right">{loc.property_count.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">₹{loc.median_price_lakh.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">₹{loc.average_price_per_sqft.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

    </div>
  );
}
