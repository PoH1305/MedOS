
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, InsurancePolicy } from '../types';
import { gemini } from '../services/gemini';
import { db } from '../services/database';

interface RecordsIntelligenceProps {
  user: UserProfile;
  onAnalysisComplete: (result: any) => void;
  persistentState: any;
  setPersistentState: (updater: (prev: any) => any) => void;
}

const RecordsIntelligence: React.FC<RecordsIntelligenceProps> = ({ user, onAnalysisComplete, persistentState, setPersistentState }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [showAdvocate, setShowAdvocate] = useState(false);
  const [insurance, setInsurance] = useState<InsurancePolicy | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { analysisResult } = persistentState;

  useEffect(() => {
    const loadData = async () => {
      const policies = await db.getAll<InsurancePolicy>('insurance_policies');
      if (policies.length > 0) setInsurance(policies[0]);
      
      const scans = await db.getAll<any>('scans');
      setHistory(scans.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    };
    loadData();
    return () => stopCamera(); 
  }, []);

  useEffect(() => {
    const initStream = async () => {
      if (isCameraOpen && !streamRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, 
            audio: false 
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Camera access error:", err);
          alert("Could not access camera. Please check your browser permissions.");
          setIsCameraOpen(false);
        }
      }
    };
    initStream();
  }, [isCameraOpen]);

  const updateState = (updates: any) => {
    setPersistentState((prev: any) => ({ ...prev, ...updates }));
  };

  const processImageData = async (dataUrl: string, fileType: string) => {
    setIsAnalyzing(true);
    setLoadingStep('Initializing Neural Scan');
    updateState({ filePreview: dataUrl });
    setShowAdvocate(false);
    
    try {
      setLoadingStep('Auditing Clinical Record');
      const base64Data = dataUrl.split(',')[1];
      const result = await gemini.analyzeReport(base64Data, fileType, user, insurance || undefined);
      
      setLoadingStep('Deducing Pharmacological Patterns');
      updateState({ analysisResult: result });
      await onAnalysisComplete(result);
      
      const scans = await db.getAll<any>('scans');
      setHistory(scans.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (err) { 
      console.error(err); 
      alert("Clinical Audit Failed. Mobile connection might be unstable.");
    } finally { 
      setIsAnalyzing(false); 
      setLoadingStep('');
    }
  };

  const compressAndProcess = (imgSource: HTMLImageElement | HTMLVideoElement) => {
    const canvas = document.createElement('canvas');
    const MAX_WIDTH = 1280;
    let width = imgSource instanceof HTMLVideoElement ? imgSource.videoWidth : imgSource.width;
    let height = imgSource instanceof HTMLVideoElement ? imgSource.videoHeight : imgSource.height;

    if (width > MAX_WIDTH) {
      height *= MAX_WIDTH / width;
      width = MAX_WIDTH;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(imgSource, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      processImageData(dataUrl, 'image/jpeg');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => compressAndProcess(img);
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const startCamera = () => setIsCameraOpen(true);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      compressAndProcess(videoRef.current);
      stopCamera();
    }
  };

  const handleViewHistorical = (scan: any) => {
    updateState({ analysisResult: scan, filePreview: null });
    setShowAdvocate(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyEmailToClipboard = () => {
    if (analysisResult?.bioAdvocacyEmail?.body) {
      navigator.clipboard.writeText(analysisResult.bioAdvocacyEmail.body);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  const handleSendEmail = () => {
    if (analysisResult?.bioAdvocacyEmail) {
      const { subject, body, recipientEmail } = analysisResult.bioAdvocacyEmail;
      const mailtoLink = `mailto:${recipientEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      <div className="bg-white rounded-[32px] md:rounded-[48px] border p-8 md:p-12 text-center shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-900 text-white rounded-[24px] md:rounded-[32px] flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-xl">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Lab Scan Auditor</h2>
          <p className="text-slate-500 mt-2 mb-8 md:mb-10 max-w-xs mx-auto text-xs md:text-sm font-medium">Analyze prescriptions or bills instantly for clinical errors.</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={startCamera}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 md:py-5 bg-indigo-600 text-white rounded-2xl md:rounded-[28px] font-black uppercase tracking-widest hover:bg-indigo-700 active:scale-95 shadow-xl transition-all"
            >
              Snap Photo
            </button>
            <label className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 md:py-5 bg-slate-900 text-white rounded-2xl md:rounded-[28px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-800 active:scale-95 shadow-xl transition-all">
              Upload
              <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} />
            </label>
            {analysisResult && (
              <button 
                onClick={() => updateState({ analysisResult: null })}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-4 md:py-5 bg-slate-100 text-slate-500 rounded-2xl md:rounded-[28px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Clear View
              </button>
            )}
          </div>
        </div>
      </div>

      {isCameraOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-black rounded-[32px] overflow-hidden shadow-2xl border-2 border-indigo-600/50">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-[60vh] object-cover" />
            <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-10">
              <button onClick={stopCamera} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center border border-white/10">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <button onClick={capturePhoto} className="w-20 h-20 rounded-full bg-white p-1 flex items-center justify-center shadow-2xl scale-110 active:scale-95 transition-all">
                <div className="w-full h-full rounded-full border-4 border-slate-900 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-slate-200"></div>
                </div>
              </button>
              <div className="w-12 h-12"></div>
            </div>
          </div>
        </div>
      )}

      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 animate-pulse">{loadingStep}</p>
          </div>
        </div>
      )}

      {analysisResult && !isAnalyzing ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 animate-in slide-in-from-bottom-8 duration-700">
          <div className="bg-white rounded-[32px] border p-8 space-y-6 shadow-sm">
             <div className="flex justify-between items-start">
                <div>
                  <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">{analysisResult.docType?.toUpperCase()} Audit</p>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">{analysisResult.hospitalName || 'Clinical Facility'}</h3>
                </div>
                {analysisResult.docType === 'bill' && (
                  <div className="px-4 py-2 bg-slate-900 rounded-2xl text-white text-right">
                    <p className="text-[7px] font-black uppercase opacity-60 tracking-widest">Charges</p>
                    <p className="text-lg font-black">{analysisResult.billingAudit?.totalAmount}</p>
                  </div>
                )}
             </div>

             <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">Deduced Context</p>
                <p className="text-lg font-black text-slate-900 leading-tight">{analysisResult.deducedCondition || "General Wellness"}</p>
             </div>

             {analysisResult.clinicalIntegrity?.medications?.length > 0 && (
               <div className="space-y-3">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Detected Protocols</p>
                 {analysisResult.clinicalIntegrity.medications.map((m: any, i: number) => (
                   <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                     <div className="flex justify-between items-start mb-1">
                       <h4 className="text-sm font-black text-slate-900">{m.name}</h4>
                       <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">{m.purpose}</span>
                     </div>
                     <p className="text-[10px] text-slate-600 font-bold leading-relaxed">{m.reasoning}</p>
                   </div>
                 ))}
               </div>
             )}

             {analysisResult.billingAudit?.coverageDiscrepancies?.length > 0 && (
               <div className="space-y-3">
                 <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Insurance Mismatch</p>
                 <div className="space-y-2">
                   {analysisResult.billingAudit.coverageDiscrepancies.map((item: string, i: number) => (
                     <div key={i} className="flex gap-2 p-3 bg-rose-50 rounded-xl border border-rose-100 text-[10px] font-bold text-rose-900">
                       <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       {item}
                     </div>
                   ))}
                 </div>
               </div>
             )}
          </div>

          <div className="space-y-6">
            {analysisResult.clinicalIntegrity?.faultyMeds?.length > 0 && (
              <div className="p-6 bg-rose-50 border border-rose-100 rounded-[32px] shadow-sm">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] mb-4">Treatment Anomalies</p>
                <div className="space-y-2">
                  {analysisResult.clinicalIntegrity.faultyMeds.map((error: string, i: number) => (
                    <div key={i} className="flex gap-2 bg-white/50 p-3 rounded-xl border border-rose-100 text-xs font-black text-rose-900">{error}</div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-900 rounded-[32px] p-8 text-white space-y-6 shadow-xl overflow-hidden relative">
               <div className="relative z-10">
                 <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black tracking-tight">AI Bio-Advocacy</h3>
                    <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">MedOS v2.4</span>
                 </div>
                 
                 {/* ERROR HIGHLIGHT / SUMMARY OF MAIL */}
                 <div className="mt-4 p-5 bg-indigo-500/10 border border-dashed border-indigo-500/40 rounded-2xl">
                    <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">Audit Findings</p>
                    <p className="text-xs font-bold text-white leading-relaxed">
                      {analysisResult.bioAdvocacyEmail?.primaryErrorHighlight || 
                       (analysisResult.clinicalIntegrity?.faultyMeds?.[0]) || 
                       (analysisResult.billingAudit?.coverageDiscrepancies?.[0]) ||
                       "No critical errors identified in this scan cycle. This report serves as a verification summary."}
                    </p>
                 </div>

                 <p className="text-xs text-slate-400 font-medium leading-relaxed mt-4 mb-6 italic opacity-80">A formal medical advocacy strategy has been generated to protect your clinical and financial interests.</p>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   <button 
                      onClick={() => setShowAdvocate(!showAdvocate)}
                      className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        showAdvocate ? 'bg-white text-slate-900' : 'bg-slate-800 text-white hover:bg-slate-700'
                      }`}
                    >
                      {showAdvocate ? 'Hide Draft' : 'View Email Draft'}
                    </button>
                    
                    <button 
                      onClick={handleSendEmail}
                      className="py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-900/50 hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      Send via Mail
                    </button>
                 </div>

                  {showAdvocate && analysisResult.bioAdvocacyEmail && (
                    <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="bg-white/10 border border-white/20 p-6 rounded-3xl backdrop-blur-md">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
                           <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Formal Draft</p>
                           <button 
                             onClick={copyEmailToClipboard}
                             className="text-[9px] font-black uppercase bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/40 hover:bg-indigo-500 hover:text-white transition-all"
                           >
                             {copyFeedback ? 'Copied!' : 'Copy Text'}
                           </button>
                        </div>
                        <div className="text-[10px] text-slate-300 font-black mb-2 uppercase tracking-tighter">Subject: {analysisResult.bioAdvocacyEmail.subject}</div>
                        <div className="text-[11px] text-slate-400 leading-relaxed font-medium whitespace-pre-wrap max-h-60 overflow-y-auto custom-scrollbar pr-2 mt-4">
                           {analysisResult.bioAdvocacyEmail.body}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 justify-center text-[9px] text-slate-500 font-black uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                        Direct to: {analysisResult.bioAdvocacyEmail.recipientEmail || 'Administrative Office'}
                      </div>
                    </div>
                  )}
               </div>
               {/* Ambient effect */}
               <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] -ml-16 -mt-16"></div>
               <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-600/10 rounded-full blur-[60px] -mr-20 -mb-20"></div>
            </div>
          </div>
        </div>
      ) : !isAnalyzing && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Bio-Vault Audits</h3>
             <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{history.length} Records</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {history.map((scan) => (
               <button 
                key={scan.id}
                onClick={() => handleViewHistorical(scan)}
                className="bg-white border rounded-[32px] p-6 text-left hover:shadow-md hover:border-indigo-100 transition-all group"
               >
                 <div className="flex justify-between items-start mb-4">
                   <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                   </div>
                   <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">
                     {new Date(scan.timestamp).toLocaleDateString()}
                   </span>
                 </div>
                 <h4 className="text-sm font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">{scan.hospitalName || 'Clinical Record'}</h4>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">{scan.docType || 'Audit'}</p>
                 <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                   <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">View Analysis</span>
                   <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                 </div>
               </button>
             ))}
             {history.length === 0 && (
               <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-[32px]">
                 <p className="text-sm text-slate-400 font-medium italic">No historical audits found in your local vault.</p>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordsIntelligence;
