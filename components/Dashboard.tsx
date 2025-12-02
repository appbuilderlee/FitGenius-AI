
import React, { useState } from 'react';
import { UserSettings, WeightEntry, ExerciseLog, Achievement } from '../types';
import { ALL_ACHIEVEMENTS } from '../services/achievementService';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';
import { Plus, TrendingDown, Target, Scale, Zap, Grid, User as BodyIcon, Trophy, Award, Lock, TrendingUp, X, Calendar, CheckCircle } from 'lucide-react';
import { t } from '../utils/translations';
import * as LucideIcons from 'lucide-react';

interface DashboardProps {
  userSettings: UserSettings;
  weightHistory: WeightEntry[];
  logs?: ExerciseLog[]; 
  achievements?: Achievement[];
  onAddWeight: (weight: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userSettings, weightHistory, logs = [], achievements = [], onAddWeight }) => {
  const [newWeight, setNewWeight] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);

  const lang = userSettings.language || 'zh-TW';
  const txt = t[lang];

  const currentWeight = weightHistory.length > 0 
    ? weightHistory[weightHistory.length - 1].weight 
    : 0;

  const startWeight = weightHistory.length > 0 ? weightHistory[0].weight : currentWeight;
  const toGo = currentWeight - userSettings.targetWeight;

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newWeight);
    if (!isNaN(w) && w > 0) {
      onAddWeight(w);
      setNewWeight('');
      setShowInput(false);
    }
  };

  // --- Volume Calculation ---
  const getVolumeData = () => {
      const volMap: Record<string, number> = {};
      logs.forEach(log => {
          const date = log.date.split('T')[0];
          const weightFactor = log.weight > 0 ? log.weight : 1; 
          const vol = log.sets * log.reps * weightFactor;
          volMap[date] = (volMap[date] || 0) + vol;
      });
      return Object.entries(volMap)
        .map(([date, volume]) => ({ date, volume }))
        .sort((a,b) => a.date.localeCompare(b.date))
        .slice(-7);
  };
  const volumeData = getVolumeData();

  // --- Human Body Heatmap Logic ---
  const getBodyMapData = () => {
     const scores = { shoulders: 0, chest: 0, arms: 0, abs: 0, legs: 0 };
     logs.slice(-30).forEach(log => {
         const name = log.exerciseName.toLowerCase();
         if (name.match(/press|push|bench|chest|pec|fly/)) scores.chest++;
         if (name.match(/squat|leg|lunge|calf|glute|hamstring/)) scores.legs++;
         if (name.match(/curl|tricep|bicep|dip|arm|row|pull/)) scores.arms++;
         if (name.match(/shoulder|raise|delt|military/)) scores.shoulders++;
         if (name.match(/plank|crunch|sit|abs|core/)) scores.abs++;
     });
     return scores;
  };
  const bodyScores = getBodyMapData();

  const getHeatColor = (score: number) => {
      if (score === 0) return userSettings.theme === 'dark' ? '#1e293b' : '#e2e8f0'; 
      if (score < 3) return '#34d399'; 
      if (score < 6) return '#10b981'; 
      return '#059669'; 
  };
  
  // --- Badge Rendering ---
  const renderBadge = (badgeDef: typeof ALL_ACHIEVEMENTS[0]) => {
      const unlocked = achievements.find(a => a.id === badgeDef.id);
      const isUnlocked = !!unlocked;
      
      const IconComp = (LucideIcons as any)[badgeDef.icon] || Lock;
      const title = txt[badgeDef.titleKey] || badgeDef.id;

      return (
          <button 
            key={badgeDef.id} 
            onClick={() => setSelectedBadgeId(badgeDef.id)}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all active:scale-95 ${
                isUnlocked 
                ? 'bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-900 shadow-sm scale-100 opacity-100 hover:shadow-md' 
                : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-60 grayscale hover:opacity-80'
            }`}
          >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                  isUnlocked 
                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-500' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
              }`}>
                  {isUnlocked ? <IconComp size={24} /> : <Lock size={20} />}
              </div>
              <p className="text-[10px] font-bold text-center text-slate-700 dark:text-slate-300 leading-tight line-clamp-2">{title}</p>
          </button>
      );
  };

  // --- Badge Detail Modal ---
  const selectedBadgeDef = selectedBadgeId ? ALL_ACHIEVEMENTS.find(a => a.id === selectedBadgeId) : null;
  const selectedBadgeUnlocked = selectedBadgeId ? achievements.find(a => a.id === selectedBadgeId) : null;

  return (
    <div className="p-6 max-w-md mx-auto space-y-6 pb-24">
      
      {/* Header */}
      <div className="flex justify-between items-center animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            {txt.dash_hello}, {userSettings.name} <span className="animate-wave origin-[70%_70%]">👋</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{txt.dash_subtitle}</p>
        </div>
        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 border-2 border-white dark:border-slate-700 shadow-sm">
          {userSettings.name.charAt(0)}
        </div>
      </div>

      {/* Main Stats Card */}
      <div className="bg-emerald-600 text-white rounded-[2rem] p-6 shadow-xl shadow-emerald-200 dark:shadow-emerald-900/20 relative overflow-hidden animate-slide-up transform transition-transform hover:scale-[1.02]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">{txt.dash_current}</p>
              <h2 className="text-5xl font-black tracking-tight">{currentWeight} <span className="text-lg font-bold opacity-80">kg</span></h2>
            </div>
            <button 
              onClick={() => setShowInput(!showInput)}
              className="bg-white/20 hover:bg-white/30 p-3 rounded-2xl backdrop-blur-sm transition-all active:scale-95"
            >
              <Plus size={24} />
            </button>
          </div>

          {showInput && (
            <form onSubmit={handleAddWeight} className="mb-6 bg-white/10 p-2 rounded-xl backdrop-blur-md flex gap-2 animate-fade-in">
              <input 
                autoFocus
                type="number" 
                step="0.1" 
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder={txt.dash_input_ph}
                className="w-full bg-transparent text-white placeholder:text-emerald-200/50 px-3 py-2 outline-none font-bold"
              />
              <button type="submit" className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-bold text-sm shadow-sm">{txt.dash_save}</button>
            </form>
          )}

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-emerald-800/30 rounded-xl p-3 backdrop-blur-sm border border-emerald-500/20">
               <div className="flex items-center gap-2 mb-1 opacity-80">
                 <Target size={14} /> <span className="text-xs font-bold uppercase">{txt.dash_target}</span>
               </div>
               <p className="text-lg font-bold">{userSettings.targetWeight} kg</p>
             </div>
             <div className="bg-emerald-800/30 rounded-xl p-3 backdrop-blur-sm border border-emerald-500/20">
               <div className="flex items-center gap-2 mb-1 opacity-80">
                 <TrendingDown size={14} /> <span className="text-xs font-bold uppercase">{txt.dash_togo}</span>
               </div>
               <p className="text-lg font-bold">{Math.abs(toGo).toFixed(1)} kg</p>
             </div>
          </div>
        </div>
      </div>
      
      {/* Weight Trend Chart */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
          <TrendingUp size={16} className="text-emerald-500" /> {txt.dash_chart_title}
        </h3>
        {weightHistory.length > 0 ? (
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weightHistory}>
                        <defs>
                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={userSettings.theme === 'dark' ? '#334155' : '#e2e8f0'} />
                        <XAxis 
                            dataKey="date" 
                            tick={{fontSize: 10}} 
                            tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month:'numeric', day:'numeric'})} 
                            stroke={userSettings.theme === 'dark' ? '#94a3b8' : '#64748b'} 
                        />
                        <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: userSettings.theme === 'dark' ? '#1e293b' : '#fff' }}
                            itemStyle={{ color: userSettings.theme === 'dark' ? '#fff' : '#0f172a', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                        {userSettings.targetWeight && (
                            <ReferenceLine y={userSettings.targetWeight} stroke="#fbbf24" strokeDasharray="3 3" />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        ) : (
            <div className="h-32 flex items-center justify-center text-slate-400 text-xs italic bg-slate-50 dark:bg-slate-800 rounded-xl">
                 {txt.dash_no_data}
            </div>
        )}
      </div>

      {/* Badge Wall */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Award size={16} className="text-amber-500" /> {txt.dash_ach_wall}
              </h3>
              <span className="text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">{achievements.length} / {ALL_ACHIEVEMENTS.length}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
              {ALL_ACHIEVEMENTS.map(badge => renderBadge(badge))}
          </div>
      </div>

      {/* Human Heatmap */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
          <BodyIcon size={16} className="text-emerald-500" /> {txt.dash_heatmap_title}
        </h3>
        <div className="flex justify-center py-4">
            <svg viewBox="0 0 200 350" className="h-64 drop-shadow-xl" fill="none" stroke="currentColor" strokeWidth="2">
                {/* Simplified Body Map */}
                <path d="M100 20 L100 50" stroke={userSettings.theme === 'dark' ? '#475569' : '#cbd5e1'} />
                <circle cx="100" cy="35" r="15" fill={getHeatColor(0)} stroke="none" opacity="0.5" /> 
                {/* Shoulders */}
                <path d="M70 60 Q100 50 130 60" stroke="none" fill={getHeatColor(bodyScores.shoulders)} className="transition-colors duration-500" />
                {/* Chest */}
                <rect x="80" y="65" width="40" height="30" rx="5" fill={getHeatColor(bodyScores.chest)} className="transition-colors duration-500" stroke="none"/>
                {/* Abs */}
                <rect x="85" y="100" width="30" height="40" rx="5" fill={getHeatColor(bodyScores.abs)} className="transition-colors duration-500" stroke="none"/>
                {/* Arms */}
                <rect x="50" y="70" width="20" height="60" rx="5" fill={getHeatColor(bodyScores.arms)} className="transition-colors duration-500" stroke="none"/>
                <rect x="130" y="70" width="20" height="60" rx="5" fill={getHeatColor(bodyScores.arms)} className="transition-colors duration-500" stroke="none"/>
                {/* Legs */}
                <rect x="75" y="150" width="20" height="90" rx="5" fill={getHeatColor(bodyScores.legs)} className="transition-colors duration-500" stroke="none"/>
                <rect x="105" y="150" width="20" height="90" rx="5" fill={getHeatColor(bodyScores.legs)} className="transition-colors duration-500" stroke="none"/>
            </svg>
        </div>
      </div>

      {/* Volume Chart */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2 uppercase tracking-wider">
          <Zap size={16} className="text-emerald-500" /> {txt.dash_vol_chart_title}
        </h3>
        {volumeData.length > 0 ? (
             <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volumeData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={userSettings.theme === 'dark' ? '#334155' : '#e2e8f0'} />
                        <XAxis dataKey="date" tick={{fontSize: 10}} tickFormatter={(val) => new Date(val).getDate().toString()} stroke={userSettings.theme === 'dark' ? '#94a3b8' : '#64748b'} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: userSettings.theme === 'dark' ? '#1e293b' : '#fff' }}
                            itemStyle={{ color: userSettings.theme === 'dark' ? '#fff' : '#0f172a', fontWeight: 'bold' }}
                        />
                        <Bar dataKey="volume" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
             </div>
        ) : (
             <div className="h-32 flex items-center justify-center text-slate-400 text-xs italic bg-slate-50 dark:bg-slate-800 rounded-xl">
                 No training volume data yet
             </div>
        )}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadgeDef && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedBadgeId(null)}></div>
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 relative z-10 animate-bounce-in shadow-2xl">
                <button onClick={() => setSelectedBadgeId(null)} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700">
                    <X size={20} />
                </button>
                
                <div className="flex flex-col items-center text-center">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg ${
                        selectedBadgeUnlocked 
                        ? 'bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-900/20 text-amber-500' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                        {(() => {
                            const Icon = (LucideIcons as any)[selectedBadgeDef.icon] || Lock;
                            return <Icon size={48} />;
                        })()}
                    </div>
                    
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                        {txt[selectedBadgeDef.titleKey] || selectedBadgeDef.id}
                    </h3>
                    
                    {selectedBadgeUnlocked ? (
                        <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold mb-4">
                            <CheckCircle size={14} /> Unlocked {new Date(selectedBadgeUnlocked.unlockedAt!).toLocaleDateString()}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full text-xs font-bold mb-4">
                            <Lock size={14} /> Locked
                        </div>
                    )}
                    
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl w-full border border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">How to unlock</p>
                        <p className="text-slate-600 dark:text-slate-300 font-medium">
                            {txt[selectedBadgeDef.descKey] || selectedBadgeDef.descKey}
                        </p>
                    </div>
                    
                    {selectedBadgeUnlocked && (
                         <div className="mt-6 text-xs text-amber-500 font-bold animate-pulse">
                             ✨ Great Job! Keep going!
                         </div>
                    )}
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
