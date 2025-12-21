
import React, { useState, useEffect } from 'react';
import { UserRole, UserProfile, Medication, HistoryRecord, SmartwatchMetrics } from './types';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import RecordsIntelligence from './components/RecordsIntelligence';
import ProfilePage from './components/Profile';
import Settings from './components/Settings';
import ConnectPlus from './components/ConnectPlus';
import AuthPage from './components/Auth/AuthPage';
import AppGuide from './components/Onboarding/AppGuide';
import { MOCK_WATCH_METRICS } from './constants';
import { db } from './services/database';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [isDbReady, setIsDbReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'records' | 'profiles' | 'settings' | 'connect+'>('dashboard');
  const [profileSubTab, setProfileSubTab] = useState<'summary' | 'history' | 'insurance'>('summary');
  
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isWatchConnected, setIsWatchConnected] = useState(false);
  const [watchMetrics, setWatchMetrics] = useState<SmartwatchMetrics>(MOCK_WATCH_METRICS);

  const [recordsState, setRecordsState] = useState<any>({
    analysisResult: null,
    filePreview: null,
    showAdvocacy: false,
    complaintSent: false,
    userContext: '',
    specificTiming: '',
    desiredResolution: '',
    finalLetterPreview: ''
  });

  useEffect(() => {
    const initApp = async () => {
      await db.init();
      const tourCompleted = localStorage.getItem('medos_tour_completed') === 'true';
      let session = await db.getById<any>('session', 'current');
      
      if (!session) {
        const defaultProfile: UserProfile = {
          id: 'default_bio_hacker',
          name: 'Bio Hacker',
          age: 20,
          gender: 'Neutral',
          country: 'India',
          conditions: ['Optimization Protocol'],
          role: UserRole.PATIENT,
          isPrimary: true,
          history: []
        };
        await db.save('profiles', defaultProfile);
        await db.save('session', { id: 'current', profileId: defaultProfile.id });
        session = { id: 'current', profileId: defaultProfile.id };
        if (!tourCompleted) setShowGuide(true);
      } else if (!tourCompleted) {
        setShowGuide(true);
      }

      const profile = await db.getById<UserProfile>('profiles', session.profileId);
      if (profile) {
        setCurrentUser(profile);
        const allProfiles = await db.getAll<UserProfile>('profiles');
        setProfiles(allProfiles);
        setMedications(await db.getAll<Medication>('medications'));
      }
      setIsDbReady(true);
    };
    initApp();
  }, []);

  const handleAuthSuccess = async (profile: UserProfile, isNew: boolean) => {
    setCurrentUser(profile);
    setProfiles(await db.getAll<UserProfile>('profiles'));
    setMedications(await db.getAll<Medication>('medications'));
    if (isNew && localStorage.getItem('medos_tour_completed') !== 'true') {
      setShowGuide(true);
    }
  };

  const handleLogout = async () => {
    await db.delete('session', 'current');
    setCurrentUser(null);
    setActiveTab('dashboard');
    setShowGuide(false);
  };

  const handleAddProfile = async (newProfile: UserProfile) => {
    await db.save('profiles', newProfile);
    const all = await db.getAll<UserProfile>('profiles');
    setProfiles(all);
    return all;
  };

  const handleProfileDeleted = async (profileId: string) => {
    await db.delete('profiles', profileId);
    const all = await db.getAll<UserProfile>('profiles');
    setProfiles(all);
    if (currentUser?.id === profileId) {
      if (all.length > 0) {
        const primary = all.find(p => p.isPrimary) || all[0];
        setCurrentUser(primary);
        await db.save('session', { id: 'current', profileId: primary.id });
      } else {
        handleLogout();
      }
    }
  };

  const handleAnalysisComplete = async (result: any) => {
    let targetProfileId = currentUser?.id;

    // 1. Detect patient from scan and find/create profile
    if (result.patientName && result.patientName !== "Unknown") {
      const existingProfile = profiles.find(p => 
        p.name.toLowerCase() === result.patientName.toLowerCase() ||
        p.name.toLowerCase().includes(result.patientName.toLowerCase())
      );

      if (existingProfile) {
        targetProfileId = existingProfile.id;
      } else {
        const newProfile: UserProfile = {
          id: `profile_${Date.now()}`,
          name: result.patientName,
          age: 20, 
          gender: 'Discovered',
          country: currentUser?.country || 'India',
          conditions: result.deducedCondition ? [result.deducedCondition] : [],
          role: UserRole.PATIENT,
          isPrimary: false,
          history: []
        };
        await handleAddProfile(newProfile);
        targetProfileId = newProfile.id;
        // Refresh local profiles list for immediate use
        const all = await db.getAll<UserProfile>('profiles');
        setProfiles(all);
      }
    }

    // 2. Persist the scan to the correct profile history
    const scanRecord = {
      id: `scan_${Date.now()}`,
      timestamp: new Date().toISOString(),
      profileId: targetProfileId,
      ...result
    };
    await db.save('scans', scanRecord);

    // 3. Logic for adding medications to the Focus Protocol
    if (result.clinicalIntegrity?.medications) {
      const newMeds: Medication[] = result.clinicalIntegrity.medications.map((m: any) => ({
        id: `med_${Date.now()}_${Math.random()}`,
        name: m.name,
        dosage: m.dosage || 'As prescribed',
        frequency: 'Daily',
        time: '09:00',
        lifestyleCaveat: m.reasoning || m.purpose
      }));

      for (const med of newMeds) {
        const exists = medications.some(em => em.name.toLowerCase() === med.name.toLowerCase());
        if (!exists) {
          await db.save('medications', med);
        }
      }
      setMedications(await db.getAll<Medication>('medications'));
    }
  };

  const handleTourComplete = () => {
    setShowGuide(false);
    localStorage.setItem('medos_tour_completed', 'true');
  };

  const handleNavigate = (tab: any, subTab?: any) => {
    if (tab === 'insurance') {
      setActiveTab('profiles');
      setProfileSubTab('insurance');
    } else {
      setActiveTab(tab);
      if (tab === 'profiles' && subTab) setProfileSubTab(subTab);
    }
  };

  const handleViewScan = (scan: any) => {
    setRecordsState({ ...recordsState, analysisResult: scan, filePreview: null });
    setActiveTab('records');
  };

  if (!isDbReady) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center space-y-6">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-white text-[10px] font-black tracking-widest uppercase text-indigo-400">Syncing Bio-Data</h2>
        </div>
      </div>
    );
  }

  if (!currentUser) return <AuthPage onAuthSuccess={handleAuthSuccess} />;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden">
      {showGuide && <AppGuide onComplete={handleTourComplete} />}
      
      <div className="hidden md:block h-full shrink-0">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      </div>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative pb-20 md:pb-0">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b px-4 md:px-6 flex items-center justify-between shrink-0 z-20 sticky top-0">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <h1 className="text-[10px] md:text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
               Private
               <span className="hidden sm:inline-block px-2 py-0.5 bg-slate-100 text-slate-500 text-[8px] rounded border border-slate-200 uppercase">Neural Shield</span>
             </h1>
          </div>
          <button 
            onClick={() => handleNavigate('profiles', 'summary')}
            className="flex items-center gap-3 hover:bg-slate-50 p-1 md:pr-4 rounded-2xl transition-all group"
          >
            <div className="text-right hidden sm:block">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">Bio-File</p>
              <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
            </div>
            <div id="tour-profile-btn" className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black uppercase shadow-lg group-hover:scale-105 transition-transform">
              {currentUser.name.charAt(0)}
            </div>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <Dashboard 
                user={currentUser} 
                notifications={[]} 
                medications={medications}
                onClearNotifications={() => {}}
                onNavigate={handleNavigate}
                isWatchConnected={isWatchConnected}
              />
            )}
            {activeTab === 'chat' && (
              <ChatInterface 
                user={currentUser} 
                isWatchConnected={isWatchConnected} 
                watchMetrics={watchMetrics}
              />
            )}
            {activeTab === 'records' && (
              <RecordsIntelligence 
                user={currentUser} 
                onAnalysisComplete={handleAnalysisComplete}
                persistentState={recordsState}
                setPersistentState={setRecordsState}
              />
            )}
            {activeTab === 'profiles' && (
              <ProfilePage 
                profiles={profiles} 
                onAddProfile={handleAddProfile}
                onUpdateProfiles={() => {}}
                onProfileDeleted={handleProfileDeleted}
                initialTab={profileSubTab}
                onViewScan={handleViewScan}
              />
            )}
            {activeTab === 'settings' && <Settings onClearData={() => {}} userContext={currentUser} medsContext={medications} />}
            {activeTab === 'connect+' && (
              <ConnectPlus 
                isConnected={isWatchConnected}
                setIsConnected={setIsWatchConnected}
                metrics={watchMetrics}
                setMetrics={setWatchMetrics}
                user={currentUser}
              />
            )}
          </div>
        </div>

        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </main>
    </div>
  );
};

export default App;
