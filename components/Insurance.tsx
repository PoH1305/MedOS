
import React, { useState } from 'react';
import { UserProfile, InsurancePolicy } from '../types';
import { gemini } from '../services/gemini';
import { db } from '../services/database';

interface InsuranceProps {
  user: UserProfile;
}

const Insurance: React.FC<InsuranceProps> = ({ user }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [policyResult, setPolicyResult] = useState<any>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = (reader.result as string).split(',')[1];
      setIsAnalyzing(true);
      try {
        const result = await gemini.analyzePolicy(base64Data, file.type, user);
        
        // Persist policy to database for the auditor
        const policy: InsurancePolicy = {
          id: Date.now().toString(),
          provider: result.provider,
          planName: result.planName,
          coverageSummary: result.coverageSummary,
          preventativeBenefits: result.preventativeBenefits || [],
          longevityScore: result.longevityScore || 50
        };
        await db.save('insurance_policies', policy);
        
        setPolicyResult(result);
      } catch (err) {
        console.error(err);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4">
      <div className="bg-white rounded-[48px] border p-12 text-center shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-20 h-20 bg-blue-600 text-white rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Policy Intelligence</h2>
          <p className="text-slate-500 mt-2 mb-10 max-w-md mx-auto font-medium">Scan your insurance policy to identify coverage for longevity tests, preventative screenings, and bio-hacking diagnostics.</p>
          
          <label className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-[28px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-100">
            {policyResult ? 'Audit New Policy' : 'Upload Policy Document'}
            <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Decoding Coverage Matrix...</p>
        </div>
      )}

      {policyResult && !isAnalyzing && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-8 duration-500">
          <div className="bg-white rounded-[40px] border p-10 space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{policyResult.provider}</p>
                <h3 className="text-2xl font-black text-slate-900">{policyResult.planName}</h3>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-blue-600">{policyResult.longevityScore}</div>
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Longevity Score</div>
              </div>
            </div>

            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
              <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Preventative Benefits</h4>
              <div className="flex flex-wrap gap-2">
                {policyResult.preventativeBenefits?.map((benefit: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-white border border-blue-100 rounded-xl text-xs font-bold text-slate-700">{benefit}</span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Coverage Audit</h4>
              <p className="text-sm font-medium text-slate-600 leading-relaxed">{policyResult.coverageSummary}</p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[40px] p-10 text-white space-y-10">
            <div>
              <h3 className="text-xl font-black mb-2">Performance Optimization</h3>
              <p className="text-xs text-slate-400">Maximize your existing policy for advanced bio-hacking tests.</p>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Expert Tip</p>
              <p className="text-sm font-bold text-slate-200">{policyResult.optimizationTip}</p>
            </div>

            <div className="space-y-4">
              <button className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900">Download Coverage Map</button>
              <button className="w-full py-4 bg-white/5 text-white border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest">Find In-Network Bio-Labs</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Insurance;
