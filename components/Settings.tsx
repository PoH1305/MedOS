
import React, { useState, useEffect } from 'react';
import { UserProfile, Medication } from '../types';
import { db } from '../services/database';

interface SettingsProps {
  onClearData: () => void;
  userContext?: UserProfile;
  medsContext?: Medication[];
}

const Settings: React.FC<SettingsProps> = ({ onClearData, userContext, medsContext }) => {
  const [toggles, setToggles] = useState<Record<number, boolean>>({
    0: true, 1: true, 2: false, 3: true, 4: true
  });
  const [dbStats, setDbStats] = useState({ profiles: 0, medications: 0, records: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const p = await db.getAll('profiles');
      const m = await db.getAll('medications');
      const k = await db.getAll('knowledge_base');
      setDbStats({ profiles: p.length, medications: m.length, records: k.length });
    };
    fetchStats();
  }, []);

  const handleToggle = (i: number) => {
    setToggles(prev => ({ ...prev, [i]: !prev[i] }));
  };

  const handleExport = () => {
    const exportData = {
      profile: userContext,
      medications: medsContext,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MedOS_Export_${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const settingsItems = [
    { label: 'Local Encrypted Storage', desc: 'Securely manage your medical data on this device using 256-bit local indexing.' },
    { label: 'Share with Physicians', desc: 'Generate temporary local links for doctors to view your health trends.' },
    { label: 'Offline Mode Intelligence', desc: 'Enable basic medical reasoning when no internet connection is found.' },
    { label: 'Biometric Login', desc: 'Require local FaceID or Fingerprint to open medical records.' },
    { label: 'Voice Input Support', desc: 'Enable local voice-to-text for interacting with the AI assistant.' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Storage Diagnostic HUD */}
      <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
             <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
             </div>
             <div>
                <h3 className="text-xl font-black tracking-tight">On-Device Storage Vault</h3>
                <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-black">Status: Private & Encrypted</p>
             </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Local Profiles</p>
               <p className="text-2xl font-black text-blue-400">{dbStats.profiles}</p>
            </div>
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Saved Meds</p>
               <p className="text-2xl font-black text-emerald-400">{dbStats.medications}</p>
            </div>
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Local Index</p>
               <p className="text-2xl font-black text-purple-400">{dbStats.records}</p>
            </div>
          </div>
          <div className="mt-8 flex items-center gap-2">
             <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 w-[12%]"></div>
             </div>
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Device usage: 0.4MB of 50MB allocated</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
      </div>

      <div className="bg-white rounded-[40px] border shadow-sm p-10">
        <div className="mb-8">
          <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
            Privacy & Identity Controls
          </h3>
          <p className="text-xs font-bold text-slate-400 mt-2">MedOS does not store medical records on external servers. All data is processed in-memory or stored locally.</p>
        </div>
        <div className="space-y-6">
           {settingsItems.map((setting, i) => (
             <div key={i} className="flex items-start justify-between py-4 border-b border-slate-50 last:border-0 group">
               <div className="max-w-[80%]">
                 <span className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{setting.label}</span>
                 <p className="text-sm text-slate-400 mt-1">{setting.desc}</p>
               </div>
               <button 
                 onClick={() => handleToggle(i)}
                 className={`w-12 h-6 rounded-full transition-all relative mt-1 ${toggles[i] ? 'bg-blue-600' : 'bg-slate-200 shadow-inner'}`}
               >
                 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${toggles[i] ? 'right-1' : 'left-1'}`}></div>
               </button>
             </div>
           ))}
        </div>
      </div>

      <div className="bg-red-50/50 rounded-[40px] border border-red-100 p-10">
        <h4 className="text-lg font-black text-red-900 mb-2 tracking-tight">System Reset</h4>
        <p className="text-sm text-red-700/70 mb-8 font-medium">Warning: This action permanently deletes all local records from this browser.</p>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={handleExport}
            className="px-8 py-4 bg-white border border-red-200 text-red-600 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all shadow-sm"
          >
            Export My Data
          </button>
          <button 
            onClick={onClearData}
            className="px-8 py-4 bg-red-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-100"
          >
            Wipe Device Storage
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
