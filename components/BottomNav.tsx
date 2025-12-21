
import React from 'react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dash', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'chat', label: 'Bio AI', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { id: 'records', label: 'Scan', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'connect+', label: 'Sync', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-xl border-t border-slate-200 px-2 py-3 pb-8">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              activeTab === tab.id ? 'scale-110' : 'opacity-40 grayscale'
            }`}
          >
            <div className={`p-2 rounded-xl ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-600'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={tab.icon} /></svg>
            </div>
            <span className={`text-[8px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-500'}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
