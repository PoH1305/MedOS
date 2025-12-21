
import React, { useState } from 'react';
import { Medication, UserProfile } from '../types';
import { gemini } from '../services/gemini';

interface MedicationManagerProps {
  medications: Medication[];
  onAdd: (m: Medication) => void;
  onDelete: (id: string) => void;
  user: UserProfile;
}

const MedicationManager: React.FC<MedicationManagerProps> = ({ medications, onAdd, onDelete, user }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [infoLoading, setInfoLoading] = useState<string | null>(null);
  const [activeInfo, setActiveInfo] = useState<{ name: string; info: string } | null>(null);

  // Add Form State
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'Once daily',
    time: '08:00'
  });

  const handleGetInfo = async (name: string) => {
    setInfoLoading(name);
    try {
      const info = await gemini.getMedicationInfo(name, user);
      setActiveInfo({ name, info });
    } catch (err) {
      setActiveInfo({ name, info: "Failed to fetch medication details. Please try again." });
    } finally {
      setInfoLoading(null);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: Date.now().toString(),
      ...formData,
      lastTaken: 'Not yet recorded'
    });
    setIsAdding(false);
    setFormData({ name: '', dosage: '', frequency: 'Once daily', time: '08:00' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Medications</h2>
          <p className="text-slate-500 text-sm">Manage prescriptions according to {user.country} pharmacy standards.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          {isAdding ? 'Cancel' : 'Add New'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white border rounded-3xl p-6 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 mb-6">
           <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required placeholder="Medication Name" className="border rounded-xl px-4 py-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input required placeholder="Dosage (e.g. 10mg)" className="border rounded-xl px-4 py-2" value={formData.dosage} onChange={e => setFormData({...formData, dosage: e.target.value})} />
              <select className="border rounded-xl px-4 py-2" value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})}>
                <option>Once daily</option>
                <option>Twice daily</option>
                <option>Three times daily</option>
                <option>As needed</option>
              </select>
              <input type="time" className="border rounded-xl px-4 py-2" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
              <button type="submit" className="md:col-span-2 bg-blue-600 text-white py-2 rounded-xl font-bold">Save Medication</button>
           </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {medications.map((med) => (
            <div key={med.id} className="bg-white border rounded-2xl p-5 shadow-sm hover:border-blue-200 transition-colors group">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{med.name}</h3>
                  <p className="text-sm text-slate-500">{med.dosage} • {med.frequency}</p>
                </div>
                <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  {med.time}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">{med.lastTaken}</span>
                <div className="flex gap-3">
                   <button onClick={() => handleGetInfo(med.name)} disabled={infoLoading === med.name} className="text-xs font-bold text-blue-600 hover:underline">Info</button>
                   <button onClick={() => onDelete(med.id)} className="text-xs font-bold text-red-500 hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Remove</button>
                </div>
              </div>
            </div>
          ))}
          {medications.length === 0 && <p className="text-center text-slate-400 py-10 italic">No medications added.</p>}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg">
             <h3 className="font-bold mb-4 flex items-center gap-2">Daily Schedule</h3>
             <div className="space-y-4">
                {medications.sort((a,b) => a.time.localeCompare(b.time)).map((m, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="text-sm font-mono text-slate-400 w-12">{m.time}</div>
                    <div className="flex-1 border-l-2 border-slate-700 pl-4 pb-4">
                       <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                          <p className="text-sm font-bold">{m.name} {m.dosage}</p>
                       </div>
                    </div>
                  </div>
                ))}
                {medications.length === 0 && <p className="text-slate-500 text-xs text-center py-4">No schedule available</p>}
             </div>
          </div>

          {activeInfo && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 animate-in fade-in slide-in-from-right-4 duration-300 relative">
              <button onClick={() => setActiveInfo(null)} className="absolute top-4 right-4 text-blue-400">×</button>
              <h4 className="font-bold text-blue-900 mb-2">{activeInfo.name} Insights ({user.country})</h4>
              <p className="text-sm text-blue-800 whitespace-pre-wrap">{activeInfo.info}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicationManager;
