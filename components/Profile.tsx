
import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import Insurance from './Insurance';
import { db } from '../services/database';

interface ProfileProps {
  profiles: UserProfile[];
  onAddProfile: (p: UserProfile) => void;
  onUpdateProfiles: (profiles: UserProfile[]) => void;
  onProfileDeleted: (profileId: string) => void;
  initialTab?: 'summary' | 'history' | 'insurance';
  onViewScan?: (scan: any) => void;
}

const ProfilePage: React.FC<ProfileProps> = ({ profiles, onAddProfile, onUpdateProfiles, onProfileDeleted, initialTab = 'summary', onViewScan }) => {
  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'history' | 'insurance'>(initialTab);
  const [selectedProfileId, setSelectedProfileId] = useState<string>(profiles.find(p => p.isPrimary)?.id || profiles[0]?.id || '');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [historicalScans, setHistoricalScans] = useState<any[]>([]);
  
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileAge, setNewProfileAge] = useState(20);
  const [newProfileCountry, setNewProfileCountry] = useState('India');
  const [newProfileGender, setNewProfileGender] = useState('Neutral');

  useEffect(() => {
    if (initialTab) {
      setActiveSubTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    const loadHistory = async () => {
      const scans = await db.getAll<any>('scans');
      const filtered = scans.filter(s => s.profileId === selectedProfileId);
      setHistoricalScans(filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    };
    loadHistory();
  }, [selectedProfileId, activeSubTab]);

  const selectedProfile = profiles.find(p => p.id === selectedProfileId);

  const handleAddProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    const newProfile: UserProfile = {
      id: Date.now().toString(),
      name: newProfileName,
      age: newProfileAge,
      gender: newProfileGender,
      country: newProfileCountry,
      conditions: [],
      role: UserRole.PATIENT,
      isPrimary: false,
      history: []
    };

    onAddProfile(newProfile);
    setSelectedProfileId(newProfile.id);
    setIsAddModalOpen(false);
    setNewProfileName('');
  };

  const confirmDelete = () => {
    if (selectedProfileId) {
      onProfileDeleted(selectedProfileId);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Profile Row Switcher - Styled as per screenshot */}
      <div className="flex flex-wrap gap-3 items-center bg-slate-100/50 p-3 rounded-[32px] border">
        {profiles.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedProfileId(p.id)}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all text-xs font-black uppercase tracking-widest ${
              selectedProfileId === p.id 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {p.name} {p.isPrimary && '(Me)'}
          </button>
        ))}
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-all shadow-sm active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>

      {selectedProfile && (
        <div className="space-y-6">
          <div className="bg-white rounded-[40px] border p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 shadow-sm">
            <div className="w-40 h-40 rounded-[48px] bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-6xl font-black text-white shadow-2xl relative overflow-hidden">
              <span className="relative z-10">{selectedProfile.name.charAt(0)}</span>
              <div className="absolute inset-0 bg-white/10 blur-xl rounded-full translate-x-10 translate-y-10"></div>
            </div>
            <div className="flex-1 space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">{selectedProfile.name}</h2>
                {!selectedProfile.isPrimary && (
                  <button onClick={() => setIsDeleteModalOpen(true)} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
              </div>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Bio-Performance Profile • {selectedProfile.age} Yrs • {selectedProfile.country}</p>
            </div>
          </div>

          <div className="flex gap-2 p-1.5 bg-slate-100/50 border shadow-sm rounded-3xl w-fit">
            <button 
              onClick={() => setActiveSubTab('summary')}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'summary' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`}
            >
              Summary
            </button>
            <button 
              onClick={() => setActiveSubTab('history')}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'history' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`}
            >
              Archive
            </button>
            <button 
              onClick={() => setActiveSubTab('insurance')}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'insurance' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`}
            >
              Insurance
            </button>
          </div>

          {activeSubTab === 'summary' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-[32px] border p-8 shadow-sm">
                  <h3 className="font-black text-slate-900 text-xl mb-8">Active Bio-Goals</h3>
                  <div className="space-y-3">
                    {selectedProfile.conditions.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedProfile.conditions.map((c, i) => (
                          <span key={i} className="px-5 py-3 bg-indigo-50/50 text-indigo-600 border border-indigo-100 rounded-2xl text-xs font-black uppercase tracking-widest">{c}</span>
                        ))}
                      </div>
                    ) : <p className="text-slate-400 italic text-sm">No clinical goals initialized.</p>}
                  </div>
                </div>
                <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">Biological Identity</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                        <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-2">Blood</p>
                        <p className="font-black text-3xl">O+</p>
                      </div>
                      <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                        <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-2">VO2 Max</p>
                        <p className="font-black text-3xl">48.2</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mb-10"></div>
                </div>
              </div>

              {/* RECENT BIO-VAULT AUDITS SECTION - Perfected layout as per screenshot */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Bio-Vault Audits</h3>
                   <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{historicalScans.length} RECORDS</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {historicalScans.slice(0, 3).map((scan) => (
                     <div key={scan.id} className="bg-white border rounded-[32px] p-6 text-left hover:shadow-lg transition-all group relative border-indigo-100/50 flex flex-col h-full">
                       <div className="flex justify-between items-start mb-8">
                          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shadow-sm">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(scan.timestamp).toLocaleDateString()}</p>
                       </div>
                       
                       <div className="flex-1">
                          <h4 className="text-sm font-black text-slate-900 mb-1 leading-tight uppercase group-hover:text-indigo-600 transition-colors">{scan.hospitalName || 'Clinical Facility'}</h4>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-8">{scan.docType || 'Audit'}</p>
                       </div>
                       
                       <button 
                        onClick={() => onViewScan?.(scan)}
                        className="flex items-center justify-between w-full pt-5 border-t border-slate-100 group-hover:border-indigo-100 transition-all"
                       >
                         <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">View Analysis</span>
                         <svg className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                       </button>
                     </div>
                   ))}

                   {historicalScans.length === 0 && (
                     <div className="col-span-full py-16 text-center bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200">
                       <p className="text-sm text-slate-400 italic font-medium">No bio-vault records discovered for this profile.</p>
                     </div>
                   )}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'history' && (
             <div className="bg-white rounded-[40px] border p-8 md:p-12 animate-in fade-in duration-500 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                   <h3 className="font-black text-slate-900 text-2xl tracking-tight">Full Bio-Archive</h3>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{historicalScans.length} Total Records</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {historicalScans.length > 0 ? (
                    historicalScans.map((scan) => (
                      <div key={scan.id} className="bg-white border rounded-[32px] p-6 text-left hover:shadow-lg transition-all group relative border-indigo-100/30 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-8">
                           <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shadow-sm">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                           </div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(scan.timestamp).toLocaleDateString()}</p>
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="text-sm font-black text-slate-900 mb-1 leading-tight uppercase group-hover:text-indigo-600 transition-colors">{scan.hospitalName || 'Clinical Facility'}</h4>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6">{scan.docType || 'Audit'}</p>
                          <div className="mb-8 p-4 bg-slate-50/50 rounded-2xl text-[10px] text-slate-500 line-clamp-2 italic font-medium leading-relaxed">
                            "{scan.summary}"
                          </div>
                        </div>

                        <button 
                         onClick={() => onViewScan?.(scan)}
                         className="flex items-center justify-between w-full pt-5 border-t border-slate-100 group-hover:border-indigo-100 transition-all"
                        >
                          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">View Analysis</span>
                          <svg className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200">
                      <p className="text-sm text-slate-400 italic font-medium">Archive empty. Start scanning clinical documents to build your bio-vibe history.</p>
                    </div>
                  )}
                </div>
             </div>
          )}

          {activeSubTab === 'insurance' && (
            <div className="animate-in fade-in duration-500">
              <Insurance user={selectedProfile} />
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="bg-white rounded-[48px] w-full max-w-lg p-10 relative z-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">New Bio-Profile</h3>
            <p className="text-sm text-slate-500 font-bold mb-8">Establish a separate clinical vault for a family member.</p>
            
            <form onSubmit={handleAddProfileSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
                <input 
                  required autoFocus
                  className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  value={newProfileName}
                  onChange={e => setNewProfileName(e.target.value)}
                  placeholder="e.g. M Mahipal"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Age</label>
                  <input 
                    type="number" required
                    className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    value={newProfileAge}
                    onChange={e => setNewProfileAge(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Gender</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none"
                    value={newProfileGender}
                    onChange={e => setNewProfileGender(e.target.value)}
                  >
                    <option>Neutral</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Country</label>
                <input 
                  className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  value={newProfileCountry}
                  onChange={e => setNewProfileCountry(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">Create Vault</button>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedProfile && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="bg-white rounded-[40px] w-full max-w-sm p-10 relative z-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight text-center mb-4">Purge Bio-Profile?</h3>
            <p className="text-sm text-slate-500 font-bold text-center leading-relaxed mb-8">Permanently delete <span className="text-rose-600">{selectedProfile.name}</span>'s profile and all clinical records?</p>
            <div className="space-y-3">
              <button onClick={confirmDelete} className="w-full py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all active:scale-95">Confirm Purge</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Keep Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
