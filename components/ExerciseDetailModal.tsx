
import React, { useState } from 'react';
import { Exercise, UserSettings, WorkoutPlan } from '../types';
import { X, Target, Dumbbell, List, Youtube, Plus, CheckCircle, ChevronRight } from 'lucide-react';
import { t } from '../utils/translations';

interface ExerciseDetailModalProps {
  exercise: Exercise;
  onClose: () => void;
  userSettings?: UserSettings; 
  plans?: WorkoutPlan[];
  onAddToPlan?: (planId: string, dayIndex: number, exercise: Exercise) => void;
}

const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({ exercise, onClose, userSettings, plans, onAddToPlan }) => {
  const lang = userSettings?.language || 'zh-TW';
  const txt = t[lang];

  const [isAdding, setIsAdding] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const handleAddToPlanClick = () => {
      if (plans && plans.length > 0) {
          setIsAdding(true);
          setSelectedPlanId(plans[0].id); // Default to first plan
          setSelectedDayIndex(0);
      } else {
          alert(txt.plan_empty_title); // Reuse empty plan message if none exist
      }
  };

  const handleConfirmAdd = () => {
      if (onAddToPlan && selectedPlanId) {
          onAddToPlan(selectedPlanId, selectedDayIndex, exercise);
          setAddedSuccess(true);
          setTimeout(() => {
              setAddedSuccess(false);
              setIsAdding(false);
          }, 1500);
      }
  };

  // Helper to get selected plan days
  const currentPlanDays = plans?.find(p => p.id === selectedPlanId)?.days || [];

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h2 className="text-xl font-bold capitalize text-slate-900 truncate pr-4">
                {exercise.name}
              </h2>
              <button 
                onClick={onClose}
                className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-0 flex-1">
              {/* Video Container */}
              <div className="w-full bg-black aspect-video relative">
                {exercise.youtubeId ? (
                    <iframe 
                        width="100%" 
                        height="100%" 
                        src={`https://www.youtube.com/embed/${exercise.youtubeId}?autoplay=0&rel=0`} 
                        title={exercise.name} 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                    ></iframe>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <Youtube size={48} className="opacity-50 mb-2" />
                        <p className="text-sm">{txt.lib_video_error}</p>
                    </div>
                )}
              </div>

              <div className="p-6 space-y-6">
                
                {/* Add to Plan Section */}
                {plans && onAddToPlan && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                        {!isAdding ? (
                             <button 
                                onClick={handleAddToPlanClick}
                                className="w-full py-3 bg-emerald-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                             >
                                <Plus size={20} /> {txt.lib_add_to_plan}
                             </button>
                        ) : addedSuccess ? (
                             <div className="w-full py-3 bg-emerald-100 text-emerald-700 rounded-lg font-bold flex items-center justify-center gap-2 animate-pulse">
                                <CheckCircle size={20} /> {txt.lib_add_success}
                             </div>
                        ) : (
                             <div className="space-y-4 animate-fade-in">
                                 <h3 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2 mb-2">
                                     {txt.lib_add_to_plan}
                                 </h3>
                                 <div>
                                     <label className="text-xs font-bold text-slate-500 uppercase block mb-1">{txt.lib_add_select_plan}</label>
                                     <div className="relative">
                                        <select 
                                            value={selectedPlanId} 
                                            onChange={(e) => {
                                                setSelectedPlanId(e.target.value);
                                                setSelectedDayIndex(0); // Reset day when plan changes
                                            }}
                                            className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white appearance-none focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                                        >
                                            {plans.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.goal} ({p.days.length} {txt.plan_days_week})
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={16} />
                                     </div>
                                 </div>
                                 
                                 <div>
                                     <label className="text-xs font-bold text-slate-500 uppercase block mb-1">{txt.lib_add_select_day}</label>
                                     <div className="relative">
                                         <select 
                                            value={selectedDayIndex}
                                            onChange={(e) => setSelectedDayIndex(Number(e.target.value))}
                                            className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white appearance-none focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                                         >
                                             {currentPlanDays.map((d, i) => (
                                                 <option key={i} value={i}>
                                                     {d.day} — {d.focus}
                                                 </option>
                                             ))}
                                         </select>
                                         <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90" size={16} />
                                     </div>
                                 </div>

                                 <div className="flex gap-2 pt-2">
                                     <button 
                                        onClick={() => setIsAdding(false)} 
                                        className="flex-1 py-3 text-slate-500 font-bold bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                                     >
                                         {txt.dash_cancel}
                                     </button>
                                     <button 
                                        onClick={handleConfirmAdd} 
                                        className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-md active:scale-95 transition-transform"
                                     >
                                         {txt.lib_add_confirm}
                                     </button>
                                 </div>
                             </div>
                        )}
                    </div>
                )}

                {/* Tags */}
                <div className="flex gap-4">
                  <div className="flex-1 bg-emerald-50 p-3 rounded-xl flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                      <Target size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-emerald-600 uppercase font-bold">{txt.lib_target}</p>
                      <p className="font-semibold text-slate-800 capitalize">{exercise.target}</p>
                    </div>
                  </div>
                  <div className="flex-1 bg-blue-50 p-3 rounded-xl flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                      <Dumbbell size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-blue-600 uppercase font-bold">{txt.lib_equip}</p>
                      <p className="font-semibold text-slate-800 capitalize">{exercise.equipment}</p>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <List size={20} className="text-emerald-500" /> {txt.lib_instr}
                  </h3>
                  <div className="space-y-4">
                    {exercise.instructions && exercise.instructions.length > 0 ? (
                        exercise.instructions.map((step, index) => (
                        <div key={index} className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                            {index + 1}
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed">
                            {step}
                            </p>
                        </div>
                        ))
                    ) : (
                        <p className="text-slate-400 text-sm italic">
                            {txt.lib_instr_loading}
                        </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  );
};

export default ExerciseDetailModal;
