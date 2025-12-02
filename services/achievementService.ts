
import { Achievement, ExerciseLog } from '../types';

export const ALL_ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
  { id: 'first_step', titleKey: 'ach_first_step', descKey: 'ach_first_step_desc', icon: 'Footprints' },
  { id: 'early_bird', titleKey: 'ach_early_bird', descKey: 'ach_early_bird_desc', icon: 'Sunrise' },
  { id: 'night_owl', titleKey: 'ach_night_owl', descKey: 'ach_night_owl_desc', icon: 'Moon' },
  { id: 'consistency_king', titleKey: 'ach_consistency', descKey: 'ach_consistency_desc', icon: 'Flame' },
  { id: 'squat_master', titleKey: 'ach_squat', descKey: 'ach_squat_desc', icon: 'Dumbbell' },
  { id: 'iron_chest', titleKey: 'ach_chest', descKey: 'ach_chest_desc', icon: 'Shield' },
  { id: 'ton_club', titleKey: 'ach_volume', descKey: 'ach_volume_desc', icon: 'Truck' },
  { id: 'marathon', titleKey: 'ach_marathon', descKey: 'ach_marathon_desc', icon: 'Timer' },
  { id: 'centurion', titleKey: 'ach_centurion', descKey: 'ach_centurion_desc', icon: 'Award' },
];

export const checkNewAchievements = (logs: ExerciseLog[], currentUnlockedIds: string[]): Achievement[] => {
  const newUnlocks: Achievement[] = [];
  const now = new Date().toISOString();
  
  // Helper to safely check if already unlocked
  const isUnlocked = (id: string) => currentUnlockedIds.includes(id);

  if (logs.length === 0) return [];

  // 1. First Step
  if (!isUnlocked('first_step') && logs.length > 0) {
    newUnlocks.push({ ...ALL_ACHIEVEMENTS.find(a => a.id === 'first_step')!, unlockedAt: now });
  }

  // 2. Centurion (100 logs)
  if (!isUnlocked('centurion') && logs.length >= 100) {
    newUnlocks.push({ ...ALL_ACHIEVEMENTS.find(a => a.id === 'centurion')!, unlockedAt: now });
  }

  // 3. Early Bird (5AM - 8AM)
  if (!isUnlocked('early_bird')) {
      const hasEarlyLog = logs.some(log => {
          const hour = new Date(log.date).getHours();
          return hour >= 5 && hour < 8;
      });
      if (hasEarlyLog) newUnlocks.push({ ...ALL_ACHIEVEMENTS.find(a => a.id === 'early_bird')!, unlockedAt: now });
  }

  // 4. Night Owl (22PM - 2AM)
  if (!isUnlocked('night_owl')) {
      const hasNightLog = logs.some(log => {
          const hour = new Date(log.date).getHours();
          return hour >= 22 || hour < 2;
      });
      if (hasNightLog) newUnlocks.push({ ...ALL_ACHIEVEMENTS.find(a => a.id === 'night_owl')!, unlockedAt: now });
  }

  // 5. Marathon (Duration > 90 min in one session? Logs are per exercise, so let's check sum per day)
  if (!isUnlocked('marathon')) {
      const dailyDuration: Record<string, number> = {};
      logs.forEach(log => {
          const day = log.date.split('T')[0];
          dailyDuration[day] = (dailyDuration[day] || 0) + log.durationMinutes;
      });
      if (Object.values(dailyDuration).some(d => d >= 90)) {
           newUnlocks.push({ ...ALL_ACHIEVEMENTS.find(a => a.id === 'marathon')!, unlockedAt: now });
      }
  }

  // 6. Squat Master (>1000 reps total for squat variations)
  if (!isUnlocked('squat_master')) {
      const squatReps = logs
        .filter(l => l.exerciseName.toLowerCase().match(/squat|leg press|lunge/))
        .reduce((sum, l) => sum + (l.sets * l.reps), 0);
      if (squatReps >= 1000) newUnlocks.push({ ...ALL_ACHIEVEMENTS.find(a => a.id === 'squat_master')!, unlockedAt: now });
  }

  // 7. Iron Chest (>500 reps for chest)
  if (!isUnlocked('iron_chest')) {
      const chestReps = logs
        .filter(l => l.exerciseName.toLowerCase().match(/bench|press|push up|fly|pec/))
        .reduce((sum, l) => sum + (l.sets * l.reps), 0);
      if (chestReps >= 500) newUnlocks.push({ ...ALL_ACHIEVEMENTS.find(a => a.id === 'iron_chest')!, unlockedAt: now });
  }

  // 8. 10 Ton Club (Volume > 10000kg)
  if (!isUnlocked('ton_club')) {
      const totalVolume = logs.reduce((sum, l) => sum + (l.sets * l.reps * (l.weight || 0)), 0);
      if (totalVolume >= 10000) newUnlocks.push({ ...ALL_ACHIEVEMENTS.find(a => a.id === 'ton_club')!, unlockedAt: now });
  }

  // 9. Consistency King (7 Day Streak)
  if (!isUnlocked('consistency_king')) {
      // Get unique dates sorted desc
      const dates = Array.from(new Set(logs.map(l => l.date.split('T')[0]))).sort().reverse();
      let streak = 0;
      if (dates.length > 0) {
          // Check if latest is today or yesterday
          const today = new Date().toISOString().split('T')[0];
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          
          if (dates[0] === today || dates[0] === yesterday) {
              streak = 1;
              for (let i = 0; i < dates.length - 1; i++) {
                  const curr = new Date(dates[i]);
                  const prev = new Date(dates[i+1]);
                  const diffTime = Math.abs(curr.getTime() - prev.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                  if (diffDays === 1) {
                      streak++;
                  } else {
                      break;
                  }
              }
          }
      }
      if (streak >= 7) newUnlocks.push({ ...ALL_ACHIEVEMENTS.find(a => a.id === 'consistency_king')!, unlockedAt: now });
  }

  return newUnlocks;
};
