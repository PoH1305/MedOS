
import React, { useState, useEffect } from 'react';
import { SmartwatchMetrics, UserProfile } from '../types';
import { gemini } from '../services/gemini';

interface ConnectPlusProps {
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
  metrics: SmartwatchMetrics;
  setMetrics: (metrics: any) => void;
  user: UserProfile;
}

const ConnectPlus: React.FC<ConnectPlusProps> = ({ isConnected, setIsConnected, metrics, setMetrics, user }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isNutritionLinked, setIsNutritionLinked] = useState(false);
  const [isLinkingNutrition, setIsLinkingNutrition] = useState(false);
  
  // Nutrition State
  const [mealInput, setMealInput] = useState('');
  const [isAnalyzingMeal, setIsAnalyzingMeal] = useState(false);
  const [lastMealResult, setLastMealResult] = useState<any>(null);
  const [dailyCalories, setDailyCalories] = useState(1450);

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 2000);
  };

  const handleLinkNutrition = () => {
    setIsLinkingNutrition(true);
    setTimeout(() => {
      setIsLinkingNutrition(false);
      setIsNutritionLinked(true);
    }, 2500);
  };

  const handleLogMeal = async () => {
    if (!mealInput.trim()) return;
    setIsAnalyzingMeal(true);
    try {
      const result = await gemini.analyzeNutrition(mealInput, user);
      setLastMealResult(result);
      if (result.calories) {
        setDailyCalories(prev => prev + result.calories);
      }
      setMealInput('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzingMeal(false);
    }
  };

  // Simulate real-time heart rate variation if connected
  useEffect(() => {
    let interval: any;
    if (isConnected) {
      interval = setInterval(() => {
        setMetrics((prev: SmartwatchMetrics) => ({
          ...prev,
          heartRate: prev.heartRate + (Math.random() > 0.5 ? 1 : -1)
        }));
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isConnected, setMetrics]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Device Connection Status */}
      <div className="bg-white rounded-3xl border shadow-sm p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 ${isConnected ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2" />
            </svg>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Connect+</h2>
            <p className="text-slate-500 font-medium">Continuous Health Monitoring & Insights</p>
            <div className="mt-2 flex items-center justify-center md:justify-start gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
              <span className={`text-xs font-bold uppercase tracking-widest ${isConnected ? 'text-green-600' : 'text-slate-400'}`}>
                {isConnected ? 'Device Synced' : isConnecting ? 'Searching...' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
        
        {!isConnected ? (
          <button 
            onClick={handleConnect}
            disabled={isConnecting}
            className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:bg-slate-300 disabled:shadow-none"
          >
            {isConnecting ? 'Linking Device...' : 'Pair Smartwatch'}
          </button>
        ) : (
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Battery Level</p>
              <p className="text-sm font-black text-slate-800">{metrics.battery}%</p>
            </div>
            <button 
              onClick={() => setIsConnected(false)}
              className="px-6 py-2 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs hover:bg-red-50 hover:text-red-600 transition-all"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      {isConnected ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
          {/* Heart Rate */}
          <div className="bg-white rounded-3xl border shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
              </div>
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase">Live</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Heart Rate</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-4xl font-black text-slate-900">{metrics.heartRate}</span>
              <span className="text-sm font-bold text-slate-400 mb-1">BPM</span>
            </div>
            <div className="mt-4 h-12 flex items-end gap-1">
              {[40, 50, 45, 60, 55, 65, 60, 70, 68, 65].map((h, i) => (
                <div key={i} className="flex-1 bg-red-100 rounded-t-sm" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>

          {/* Blood Oxygen */}
          <div className="bg-white rounded-3xl border shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.829c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">SpO2</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Blood Oxygen</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-4xl font-black text-slate-900">{metrics.bloodOxygen}</span>
              <span className="text-sm font-bold text-slate-400 mb-1">%</span>
            </div>
            <p className="text-xs text-green-600 font-bold mt-4">Normal Range</p>
          </div>

          {/* Sleep Tracking */}
          <div className="bg-white rounded-3xl border shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sleep Duration</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-4xl font-black text-slate-900">{metrics.sleepHours}</span>
              <span className="text-sm font-bold text-slate-400 mb-1">Hours</span>
            </div>
            <div className="flex gap-2 mt-4">
              <div className="h-1 bg-purple-500 rounded-full flex-[0.2]"></div>
              <div className="h-1 bg-purple-300 rounded-full flex-[0.5]"></div>
              <div className="h-1 bg-purple-100 rounded-full flex-[0.3]"></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Deep • Light • REM</p>
          </div>
        </div>
      ) : (
        <div className="bg-white border-4 border-dashed rounded-[40px] p-20 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Sync Your Device</h3>
          <p className="text-slate-400 mt-2 max-w-sm font-medium">Connect your Apple Watch, Garmin, or Fitbit to unlock real-time continuous health tracking.</p>
        </div>
      )}

      {/* Nutrition Section */}
      <div className={`transition-all duration-700 ${isNutritionLinked ? 'opacity-100' : 'opacity-80'}`}>
        {!isNutritionLinked ? (
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                AI Wellness & Nutrition Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
                    <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">Longevity Strategy</p>
                    <p className="text-sm font-medium leading-relaxed">By linking your nutrition app, MedOS can correlate your heart rate spikes with inflammatory markers in common Indian dishes, optimizing your metabolism for longevity.</p>
                  </div>
                </div>
                <div className="flex flex-col justify-center items-center text-center p-8 bg-blue-500/10 rounded-[40px] border border-blue-400/20">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-blue-500/40">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h4 className="text-xl font-black mb-2 tracking-tight">Unlock Wellness Matrix</h4>
                  <p className="text-blue-100/70 text-sm mb-6">Connect your nutrition data to get a holistic view of your longevity factors and metabolic health.</p>
                  <button 
                    onClick={handleLinkNutrition}
                    disabled={isLinkingNutrition}
                    className="px-8 py-4 bg-white text-blue-950 rounded-2xl font-black text-sm hover:scale-105 transition-transform active:scale-95 disabled:opacity-50"
                  >
                    {isLinkingNutrition ? 'Linking Apps...' : 'Link Nutrition App'}
                  </button>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-white rounded-[40px] border shadow-sm p-8">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                   <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.703 2.703 0 01-3 0 2.704 2.704 0 01-3 0 2.703 2.703 0 01-3 0 2.704 2.704 0 01-1.5-.454M3 8V4a2 2 0 012-2h14a2 2 0 012 2v4M5 20h14a2 2 0 002-2V8H3v10a2 2 0 002 2z" /></svg>
                   </div>
                   Indian Nutrition Matrix
                </h3>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 uppercase tracking-widest">App Synced</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 space-y-4">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Daily Calories</p>
                    <p className="text-2xl font-black text-slate-900">{dailyCalories}</p>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-3 bg-slate-50 rounded-[32px] p-8 border border-slate-100">
                   <h4 className="font-black text-slate-800 mb-6">Log Indian Meal (AI Scan)</h4>
                   <div className="flex gap-4">
                      <input 
                        className="flex-1 bg-white border rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none" 
                        placeholder="e.g. 2 Jowar Rotis, 1 bowl Moong Dal and Bhindi Fry..." 
                        value={mealInput}
                        onChange={(e) => setMealInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogMeal()}
                      />
                      <button 
                        onClick={handleLogMeal}
                        disabled={isAnalyzingMeal}
                        className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
                      >
                        {isAnalyzingMeal ? 'Analyzing...' : 'Log Meal'}
                      </button>
                   </div>

                   {lastMealResult && (
                     <div className="mt-8 p-6 bg-white rounded-3xl border border-emerald-100 animate-in slide-in-from-top-2">
                        <div className="flex justify-between items-start mb-4">
                           <div className="flex items-center gap-3">
                              <span className={`w-3 h-3 rounded-full ${lastMealResult.isHealthy ? 'bg-emerald-500' : 'bg-orange-500'}`}></span>
                              <p className="text-sm font-black text-slate-800">Nutritional Breakdown</p>
                           </div>
                           <span className="text-xs font-bold text-emerald-600">+{lastMealResult.calories} kcal</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                           <div className="bg-slate-50 p-3 rounded-xl">
                              <p className="text-[8px] font-black text-slate-400 uppercase">Protein</p>
                              <p className="text-xs font-black">{lastMealResult.protein}</p>
                           </div>
                           <div className="bg-slate-50 p-3 rounded-xl">
                              <p className="text-[8px] font-black text-slate-400 uppercase">Carbs</p>
                              <p className="text-xs font-black">{lastMealResult.carbs || 'N/A'}</p>
                           </div>
                           <div className="bg-slate-50 p-3 rounded-xl">
                              <p className="text-[8px] font-black text-slate-400 uppercase">Fats</p>
                              <p className="text-xs font-black">{lastMealResult.fats || 'N/A'}</p>
                           </div>
                        </div>
                        <div className="flex gap-4 items-start bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                           <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                           <p className="text-xs text-emerald-900 font-bold leading-relaxed">{lastMealResult.healthTip}</p>
                        </div>
                     </div>
                   )}
                </div>
              </div>
            </div>

            <div className="p-8 bg-indigo-900 rounded-[40px] text-white flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
               <div className="w-20 h-20 bg-indigo-800 rounded-full flex items-center justify-center text-indigo-300 relative z-10">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
               </div>
               <div className="flex-1 relative z-10">
                  <h4 className="text-xl font-black mb-1">Longevity Correlation Active</h4>
                  <p className="text-sm text-indigo-200">AI is correlating your post-meal glucose spikes with your evening heart-rate variability. We'll have a report ready in 3 days.</p>
               </div>
               <button className="px-6 py-3 bg-white text-indigo-900 rounded-2xl font-black text-xs uppercase tracking-widest relative z-10">View Predictions</button>
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectPlus;
