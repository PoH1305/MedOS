
import React, { useState } from 'react';
import { UserProfile, Medication } from '../types';
import { gemini } from '../services/gemini';
import { MOCK_VITALS, MOCK_INSIGHTS } from '../constants';
import { 
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis 
} from 'recharts';

interface DashboardProps {
  user: UserProfile;
  notifications: string[];
  medications: Medication[];
  onClearNotifications: () => void;
  onNavigate: (tab: any, subTab?: any) => void;
  isWatchConnected: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ user, medications, onNavigate, isWatchConnected }) => {
  const [places, setPlaces] = useState<any[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [insightIndex, setInsightIndex] = useState(0);
  const [selectedMedForInfo, setSelectedMedForInfo] = useState<Medication | null>(null);

  const nextInsight = () => setInsightIndex((prev) => (prev + 1) % MOCK_INSIGHTS.length);
  const prevInsight = () => setInsightIndex((prev) => (prev - 1 + MOCK_INSIGHTS.length) % MOCK_INSIGHTS.length);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      {/* Bio-Sync Hero Section */}
      <div id="tour-dashboard" className="bg-slate-900 rounded-[32px] md:rounded-[48px] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-4 md:space-y-6">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-500 ${
              isWatchConnected ? 'bg-indigo-500/20 border-indigo-500/40' : 'bg-slate-500/10 border-slate-500/20'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isWatchConnected ? 'bg-indigo-400 animate-pulse' : 'bg-slate-500'}`}></div>
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-indigo-300">
                {isWatchConnected ? 'Bio-Sync Active' : 'Offline Bio-Vibe'}
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight">
              {getTimeGreeting()}, <br/>
              <span className="text-indigo-400">{user.name.split(' ')[0]}</span>
            </h2>
            <p className="text-slate-400 font-medium text-sm md:text-lg max-w-sm">
              Bio-age tracking <span className="text-emerald-400 font-black">1.4 yrs younger</span>. High performance detected.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
               <button onClick={() => onNavigate('chat')} className="px-6 md:px-8 py-3 md:py-4 bg-indigo-600 text-white rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all">Bio-Consult</button>
               <button onClick={() => onNavigate('records')} className="px-6 md:px-8 py-3 md:py-4 bg-white/10 text-white rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all">Scan Records</button>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
             <div className="relative w-40 h-40 md:w-64 md:h-64 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 md:border-8 border-indigo-500/10"></div>
                <div className="absolute inset-0 rounded-full border-t-4 md:border-t-8 border-indigo-500 animate-[spin_4s_linear_infinite]"></div>
                <div className="text-center">
                   <p className="text-[8px] md:text-[10px] font-black text-indigo-300 uppercase tracking-widest">Readiness</p>
                   <p className="text-4xl md:text-7xl font-black text-white">92</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <div className="bg-white rounded-[32px] md:rounded-[40px] border shadow-sm p-6 md:p-10 space-y-6 md:space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Recovery & HRV Analytics</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Telemetry Source: Wearable Index</p>
              </div>
              <span className="px-3 py-1 bg-indigo-50 rounded-full text-[9px] font-bold text-indigo-600 border border-indigo-100">72ms Mean</span>
            </div>

            <div className="h-48 md:h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_VITALS}>
                  <defs>
                    <linearGradient id="colorHrv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                  <YAxis hide />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Area type="monotone" dataKey="hrv" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorHrv)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-50">
               <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Longevity Insights</h3>
               <div className="flex gap-2">
                 <button onClick={prevInsight} className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50">←</button>
                 <button onClick={nextInsight} className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50">→</button>
               </div>
            </div>
            <div className="p-8 md:p-10 bg-indigo-50/20">
               <div key={insightIndex} className="animate-in slide-in-from-right-8 duration-500 min-h-[80px]">
                  <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${MOCK_INSIGHTS[insightIndex].color}`}>
                    {MOCK_INSIGHTS[insightIndex].type}
                  </p>
                  <p className="text-sm md:text-lg font-bold text-slate-700 leading-relaxed italic">
                    "{MOCK_INSIGHTS[insightIndex].text}"
                  </p>
               </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6 md:space-y-8">
          {/* Enhanced Focus Protocol with Tablets - Transparent Glass Effect Applied */}
          <div className="bg-indigo-600/10 backdrop-blur-2xl border border-indigo-500/20 rounded-[32px] p-8 text-slate-900 shadow-xl relative overflow-hidden flex flex-col min-h-[420px]">
             <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                   <div>
                      <h3 className="text-xl font-black tracking-tight">Focus Protocol</h3>
                      <p className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-1">Active Bio-Optimization</p>
                   </div>
                   <div className="px-2 py-0.5 bg-indigo-600 rounded-full text-[8px] font-black uppercase text-white tracking-widest animate-pulse">Live</div>
                </div>

                <div className="space-y-4 max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
                  {medications.length > 0 ? (
                    medications.map((med, idx) => (
                      <div key={idx} className="bg-white/70 backdrop-blur-md border border-indigo-100 rounded-2xl p-4 group hover:bg-white transition-all shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.829c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-black tracking-tight text-slate-900">{med.name}</p>
                            <p className="text-[9px] text-indigo-600 font-bold uppercase tracking-widest">{med.dosage} • {med.time}</p>
                          </div>
                          <button 
                            onClick={() => setSelectedMedForInfo(med)}
                            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                            title="Bio-Intel"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center border-2 border-dashed border-indigo-200 rounded-[32px]">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-4 leading-relaxed">
                        No active bio-protocols found. <br/>
                        <span className="text-slate-600">Scan a record to initialize.</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                   <p className="text-[9px] text-slate-500 font-medium leading-relaxed mb-6">
                      System state optimal. Protocol compliance is currently <span className="text-indigo-600 font-black">94%</span> for this cycle.
                   </p>
                   <button 
                      onClick={() => onNavigate('records')}
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all"
                   >
                      {medications.length > 0 ? 'Log Completion' : 'Initialize Protocol Scan'}
                   </button>
                </div>
             </div>
             {/* Decorative gradient blur */}
             <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px] -mr-40 -mt-40"></div>
          </div>

          <div className="bg-white rounded-[32px] border shadow-sm p-8 flex flex-col justify-between min-h-[250px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900">System State</h3>
              <span className="text-2xl font-black text-indigo-600">82%</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                 <span className="text-[10px] font-bold text-slate-600">Musculoskeletal</span>
                 <span className="text-[10px] text-emerald-500 font-black uppercase">Optimized</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                 <span className="text-[10px] font-bold text-slate-600">Neural Load</span>
                 <span className="text-[10px] text-rose-500 font-black uppercase">Critical</span>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('connect+')}
              className="mt-6 w-full py-4 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
            >
              System Adjust
            </button>
          </div>
        </div>
      </div>

      {/* Bio-Intel Modal */}
      {selectedMedForInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedMedForInfo(null)}></div>
          <div className="bg-white/90 backdrop-blur-xl border border-indigo-100 rounded-[32px] w-full max-w-sm p-8 relative z-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.829c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <button onClick={() => setSelectedMedForInfo(null)} className="text-slate-400 hover:text-slate-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <h4 className="text-xl font-black text-slate-900 mb-1">{selectedMedForInfo.name}</h4>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-6">Bio-Protocol Intel</p>
            <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 mb-6">
              <p className="text-xs font-bold text-slate-700 leading-relaxed italic">
                "{selectedMedForInfo.lifestyleCaveat || "No specific clinical breakdown available for this bio-protocol."}"
              </p>
            </div>
            <button 
              onClick={() => setSelectedMedForInfo(null)}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
            >
              Acknowledged
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
