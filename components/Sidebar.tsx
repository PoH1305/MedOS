
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'chat', label: 'Bio AI', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
    { id: 'records', label: 'Lab Scan', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'connect+', label: 'Devices', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <aside className="w-48 bg-white border-r flex flex-col h-full z-10 shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100 italic">M</div>
          <span className="text-lg font-black tracking-tighter text-indigo-900">MedOS</span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            id={`tour-${item.id}`}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
              activeTab === item.id 
                ? 'bg-indigo-600 text-white font-bold shadow-xl shadow-indigo-100 scale-[1.02]' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-red-500 text-[9px] font-black uppercase tracking-widest">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Purge Session
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
