
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchExercises, searchExercises, ExerciseFilters } from '../services/exerciseService';
import { getExerciseDetailsWithAI } from '../services/geminiService';
import { Exercise, UserSettings, WorkoutPlan } from '../types';
import { Search, Loader2, PlayCircle, Sparkles, Filter, X } from 'lucide-react';
import ExerciseDetailModal from './ExerciseDetailModal';
import { t } from '../utils/translations';

interface ExerciseLibraryProps {
    userSettings: UserSettings;
    plans?: WorkoutPlan[];
    onAddToPlan?: (planId: string, dayIndex: number, exercise: Exercise) => void;
}

const BODY_PARTS_EN = ['All', 'Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Core', 'Cardio', 'Full Body'];
const BODY_PARTS_ZH = ['全部', '胸部', '背部', '腿部', '手臂', '肩膀', '核心', '有氧', '全身'];

const EQUIPMENT_EN = ['All', 'Bodyweight', 'Dumbbell', 'Barbell', 'Machine', 'Cables', 'Kettlebell', 'Band'];
const EQUIPMENT_ZH = ['全部', '自重', '啞鈴', '槓鈴', '器械', '纜繩', '壺鈴', '彈力帶'];

const MUSCLES_EN = ['All', 'Abs', 'Biceps', 'Triceps', 'Glutes', 'Hamstrings', 'Quads', 'Calves', 'Lats', 'Traps'];
const MUSCLES_ZH = ['全部', '腹肌', '二頭肌', '三頭肌', '臀部', '大腿後側', '股四頭肌', '小腿', '背闊肌', '斜方肌'];

const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({ userSettings, plans, onAddToPlan }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);
  const [searchParams] = useSearchParams();
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  
  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [bodyPart, setBodyPart] = useState('All');
  const [equipment, setEquipment] = useState('All');
  const [target, setTarget] = useState('All');

  // Loading detail state (lazy load)
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
  
  const lang = userSettings.language || 'zh-TW';
  const txt = t[lang];

  const bodyParts = lang === 'en' ? BODY_PARTS_EN : BODY_PARTS_ZH;
  const equipList = lang === 'en' ? EQUIPMENT_EN : EQUIPMENT_ZH;
  const muscleList = lang === 'en' ? MUSCLES_EN : MUSCLES_ZH;

  // Handle URL query params (for deep linking)
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchTerm(query);
      setDebouncedTerm(query); // Immediate set for direct links
    }
  }, [searchParams]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm), 600);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const mapFilterValue = (val: string, listEn: string[], listZh: string[]) => {
      const idx = listZh.indexOf(val);
      if (idx > -1) return listEn[idx];
      return val;
  };

  const loadExercises = async () => {
      setLoading(true);
      try {
        const filters: ExerciseFilters = {
            bodyPart: mapFilterValue(bodyPart, BODY_PARTS_EN, BODY_PARTS_ZH),
            equipment: mapFilterValue(equipment, EQUIPMENT_EN, EQUIPMENT_ZH),
            target: mapFilterValue(target, MUSCLES_EN, MUSCLES_ZH) === 'All' ? '' : target
        };
        
        // Map "All" back to empty for logic
        if (filters.bodyPart === 'All') filters.bodyPart = undefined;
        if (filters.equipment === 'All') filters.equipment = undefined;
        
        // If searching or filtering
        if (debouncedTerm || filters.bodyPart || filters.equipment || filters.target) {
            const data = await searchExercises(debouncedTerm, lang, filters);
            setExercises(data || []);
        } else {
            // Default View
            const data = await fetchExercises();
            setExercises(data || []);
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    loadExercises();
  }, [debouncedTerm, bodyPart, equipment, target, lang]);

  const handleExerciseClick = async (ex: Exercise) => {
      // If the exercise is a recommendation (lite version) without ID or Instructions, fetch full details
      if (!ex.youtubeId && (!ex.instructions || ex.instructions.length === 0)) {
          setLoadingDetailId(ex.id);
          try {
              const fullDetails = await getExerciseDetailsWithAI(ex.name, lang);
              setSelectedExercise(fullDetails);
          } catch (e) {
              console.error("Failed to load details", e);
              // Fallback to showing what we have, modal handles errors
              setSelectedExercise(ex); 
          } finally {
              setLoadingDetailId(null);
          }
      } else {
          setSelectedExercise(ex);
      }
  };

  const resetFilters = () => {
      setBodyPart('All');
      setEquipment('All');
      setTarget('All');
      setSearchTerm('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header & Search */}
      <div className="bg-white px-6 pt-6 pb-2 border-b border-slate-100 sticky top-0 z-10 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">{txt.lib_title}</h1>
        
        {/* Search Bar */}
        <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
                type="text"
                placeholder={txt.lib_search_ph}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-800 placeholder:text-slate-400"
            />
            {debouncedTerm && !loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                    <Sparkles size={16} />
                </div>
            )}
            </div>
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-xl transition-all border ${showFilters ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
                <Filter size={20} />
            </button>
        </div>

        {/* Filters Section */}
        {showFilters && (
            <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3 animate-fade-in-up">
                <div className="flex justify-between items-center mb-1">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{txt.lib_filter_toggle}</h3>
                    <button onClick={resetFilters} className="text-xs text-emerald-600 font-bold hover:underline">{txt.lib_filter_reset}</button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <label className="text-xs text-slate-500 font-semibold mb-1 block">{txt.lib_filter_bp}</label>
                        <select 
                            value={bodyPart}
                            onChange={(e) => setBodyPart(e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                            {bodyParts.map(bp => <option key={bp} value={bp}>{bp}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 font-semibold mb-1 block">{txt.lib_filter_eq}</label>
                        <select 
                            value={equipment}
                            onChange={(e) => setEquipment(e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                            {equipList.map(eq => <option key={eq} value={eq}>{eq}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 font-semibold mb-1 block">{txt.lib_filter_mus}</label>
                        <select 
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                             {muscleList.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-60 gap-4">
            <Loader2 className="animate-spin text-emerald-600" size={40} />
            <p className="text-sm text-slate-500 font-medium">{txt.lib_loading}</p>
          </div>
        ) : exercises.length === 0 ? (
          <div className="text-center text-slate-400 mt-10 p-8 border-2 border-dashed border-slate-200 rounded-2xl">
            <p>{txt.lib_no_result}</p>
            <button onClick={resetFilters} className="mt-4 text-emerald-600 font-bold text-sm">{txt.lib_filter_reset}</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exercises.map((ex) => (
              <div 
                key={ex.id} 
                onClick={() => handleExerciseClick(ex)}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col cursor-pointer active:scale-[0.98] transition-transform hover:shadow-md"
              >
                <div className="aspect-video bg-slate-900 relative flex items-center justify-center">
                   {ex.youtubeId ? (
                       <>
                        <img 
                            src={`https://img.youtube.com/vi/${ex.youtubeId}/mqdefault.jpg`}
                            alt={ex.name}
                            className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <PlayCircle className="text-white opacity-90 drop-shadow-lg" size={48} fill="rgba(0,0,0,0.5)" />
                        </div>
                       </>
                   ) : (
                       <div className="flex flex-col items-center justify-center text-slate-500 w-full h-full bg-slate-100">
                          {loadingDetailId === ex.id ? (
                              <Loader2 className="animate-spin text-emerald-500 mb-2" size={32} />
                          ) : (
                              <Sparkles className="text-emerald-300 mb-2" size={32} />
                          )}
                          <span className="text-xs font-semibold">
                              {loadingDetailId === ex.id ? txt.lib_instr_loading : 'Tap to View'}
                          </span>
                       </div>
                   )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-800 capitalize text-lg leading-tight mb-2 truncate">{ex.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {ex.bodyPart && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full uppercase font-bold">{ex.bodyPart}</span>}
                    {ex.equipment && <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-full uppercase font-bold">{ex.equipment}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedExercise && (
        <ExerciseDetailModal 
            exercise={selectedExercise} 
            onClose={() => setSelectedExercise(null)} 
            userSettings={userSettings}
            plans={plans}
            onAddToPlan={onAddToPlan}
        />
      )}
    </div>
  );
};

export default ExerciseLibrary;
