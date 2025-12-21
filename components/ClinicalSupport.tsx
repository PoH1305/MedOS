
import React, { useState } from 'react';

const ClinicalSupport: React.FC = () => {
  const [patientInput, setPatientInput] = useState('');
  
  const differentialDiagnoses = [
    { name: 'Angina Pectoris', probability: 'High', reasoning: 'Exertional chest pain, relieved by rest, history of hypertension.' },
    { name: 'Gastroesophageal Reflux Disease (GERD)', probability: 'Medium', reasoning: 'Retrosternal burning sensation, occurs after meals.' },
    { name: 'Costochondritis', probability: 'Low', reasoning: 'Localized chest wall tenderness, pain worse with deep breaths.' }
  ];

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Case Input Area */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-2xl border p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Current Patient Case
          </h3>
          <textarea 
            className="w-full h-48 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-none"
            placeholder="Enter symptoms, vitals, and patient history for clinical reasoning..."
            value={patientInput}
            onChange={(e) => setPatientInput(e.target.value)}
          />
          <button className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm">
            Generate Differentials
          </button>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 text-white shadow-lg">
           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Guidelines Reference</h4>
           <div className="space-y-3">
             <a href="#" className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-700 transition-colors group">
               <span className="text-sm font-medium">ESC Hypertension 2024</span>
               <svg className="w-4 h-4 text-slate-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
             </a>
             <a href="#" className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-700 transition-colors group">
               <span className="text-sm font-medium">AHA Heart Failure</span>
               <svg className="w-4 h-4 text-slate-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
             </a>
           </div>
        </div>
      </div>

      {/* Decision Support Dashboard */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Differential Diagnosis Support</h3>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">ICD-11 Integrated</span>
          </div>

          <div className="space-y-4">
            {differentialDiagnoses.map((dx, i) => (
              <div key={i} className="border border-slate-100 rounded-2xl p-4 hover:border-blue-200 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{dx.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    dx.probability === 'High' ? 'bg-red-50 text-red-600' : 
                    dx.probability === 'Medium' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                  }`}>
                    {dx.probability} Probability
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{dx.reasoning}</p>
                <div className="mt-4 flex gap-2">
                   <button className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">Recommended Tests</button>
                   <button className="text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">Triage Protocol</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Drug-Drug Interactions */}
        <div className="bg-red-50/50 rounded-2xl border border-red-100 p-6">
           <div className="flex items-center gap-3 mb-4">
             <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
             </div>
             <h3 className="font-bold text-red-900">Critical Medication Alerts</h3>
           </div>
           <div className="bg-white border border-red-100 rounded-xl p-4 shadow-sm">
             <div className="flex gap-4">
               <div className="shrink-0 font-mono text-xs font-bold text-red-500">ALERT DDI-402</div>
               <div>
                 <p className="text-sm font-bold text-slate-800">Warfarin + Fluconazole Interaction</p>
                 <p className="text-xs text-slate-500 mt-1">Increased risk of hemorrhage. Fluconazole inhibits CYP2C9, reducing clearance of S-warfarin.</p>
                 <div className="mt-2 flex gap-3 text-xs font-bold">
                    <span className="text-red-600 underline">Switch Medication</span>
                    <span className="text-slate-400">View Alternative (Heparin)</span>
                 </div>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalSupport;
