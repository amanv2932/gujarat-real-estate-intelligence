import { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui/Misc';
import { SectionCard, StatCard } from '../components/ui/Cards';
import { Loader2, Construction, Building, Map, HardHat, Info } from 'lucide-react';
import {
  getDevelopmentOverview, getDevelopmentReraProjects, getDevelopmentTpSchemes, getDevelopmentZones, getDevelopmentSignals
} from '../services/api';

export default function DevelopmentIntelligence() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [overview, setOverview] = useState<any>(null);
  const [reraProjects, setReraProjects] = useState<any[]>([]);
  const [tpSchemes, setTpSchemes] = useState<any[]>([]);
  const [zones, setZones] = useState<any>(null);
  const [signals, setSignals] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [overviewData, reraData, tpData, zonesData, signalsData] = await Promise.all([
          getDevelopmentOverview(),
          getDevelopmentReraProjects({ limit: 10 }), // Sample for the table
          getDevelopmentTpSchemes(),
          getDevelopmentZones(),
          getDevelopmentSignals()
        ]);

        setOverview(overviewData);
        setReraProjects(reraData.data || []);
        setTpSchemes(tpData);
        setZones(zonesData);
        setSignals(signalsData);
      } catch (err: any) {
        setError(err.message || "Failed to load development data.");
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
        <p className="text-slate-600">Loading planning & development records...</p>
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
        title="Development Intelligence" 
        subtitle="Explore Gujarat planning, RERA and development activity signals." 
      />

      <div className="bg-slate-50 border border-slate-200 rounded-md p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-slate-600">
          <p className="font-medium mb-1">Important Notice</p>
          <p>Development signals indicate planning/development activity based on available records. They are not guarantees of future appreciation, returns, or investment outcomes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="RERA Projects" 
          icon={Building} 
          value={overview?.total_rera_projects.toLocaleString()} 
        />
        <StatCard 
          title="Active Projects" 
          icon={HardHat} 
          value={overview?.active_rera_projects.toLocaleString()} 
        />
        <StatCard 
          title="TP Schemes" 
          icon={Map} 
          value={overview?.total_tp_schemes.toLocaleString()} 
        />
        <StatCard 
          title="DP Zones" 
          icon={Construction} 
          value={overview?.total_dp_zones.toLocaleString()} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Development Signals */}
        <div className="lg:col-span-1 space-y-6">
           <SectionCard title="Locality Development Signals">
             <div className="space-y-4 mt-4">
                {signals.map((signal, idx) => (
                  <div key={idx} className="border border-slate-200 p-4 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                       <h4 className="font-semibold text-slate-800">{signal.location}</h4>
                       <span className={`px-2 py-1 text-xs font-semibold rounded-full ${signal.signal_strength === 'High' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                         {signal.signal_strength} Activity
                       </span>
                    </div>
                    <p className="text-sm text-slate-600">{signal.explanation}</p>
                  </div>
                ))}
             </div>
           </SectionCard>
           
           <SectionCard title="Zone Summary">
             <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                    <tr>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2 text-right">Zones</th>
                      <th className="px-3 py-2 text-right">Area</th>
                    </tr>
                  </thead>
                  <tbody>
                    {zones?.summary.map((z: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="px-3 py-2 font-medium">{z.zone_category}</td>
                        <td className="px-3 py-2 text-right">{z.zone_count}</td>
                        <td className="px-3 py-2 text-right">{z.total_area} sq.km</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           </SectionCard>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* RERA Table */}
          <SectionCard title="RERA Projects (Sample)">
             <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                    <tr>
                      <th className="px-4 py-3">Project Name</th>
                      <th className="px-4 py-3">Locality</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">TP Scheme</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reraProjects.map((p, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">{p.project_name}</td>
                        <td className="px-4 py-3 text-slate-600">{p.locality_text || '-'}</td>
                        <td className="px-4 py-3">{p.project_type}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-md ${p.project_status?.toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                            {p.project_status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{p.tp_scheme || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </SectionCard>

          {/* TP Schemes Table */}
          <SectionCard title="TP Schemes Under Preparation">
             <div className="overflow-auto h-[350px] relative mt-4">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3">TP Scheme</th>
                      <th className="px-4 py-3">Village/Area</th>
                      <th className="px-4 py-3">Zone</th>
                      <th className="px-4 py-3 text-right">Area (Ha)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tpSchemes.map((tp, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">{tp.tp_scheme}</td>
                        <td className="px-4 py-3 text-slate-600">{tp.area_village || '-'}</td>
                        <td className="px-4 py-3">{tp.zone || '-'}</td>
                        <td className="px-4 py-3 text-right">{tp.area_ha || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
