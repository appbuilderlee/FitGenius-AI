import { Exercise } from '../types';
import { getExerciseDetailsWithAI, recommendExercises } from './geminiService';

// Static list of popular exercises for the default view
const POPULAR_EXERCISES: Exercise[] = [
    { id: '1', name: 'Push Up', bodyPart: 'Chest', target: 'Pectorals', equipment: 'Bodyweight', youtubeId: 'IODxDxX7oi4', instructions: [] },
    { id: '2', name: 'Squat', bodyPart: 'Legs', target: 'Quadriceps', equipment: 'Bodyweight', youtubeId: 'YaXPRqUwItQ', instructions: [] },
    { id: '3', name: 'Plank', bodyPart: 'Core', target: 'Abs', equipment: 'Bodyweight', youtubeId: 'pSHjTRCQxIw', instructions: [] },
    { id: '4', name: 'Burpee', bodyPart: 'Cardio', target: 'Full Body', equipment: 'Bodyweight', youtubeId: 'TU8QYXLibKE', instructions: [] },
    { id: '5', name: 'Lunge', bodyPart: 'Legs', target: 'Glutes', equipment: 'Bodyweight', youtubeId: 'QOVaHwm-Q6U', instructions: [] },
    { id: '6', name: 'Glute Bridge', bodyPart: 'Legs', target: 'Glutes', equipment: 'Bodyweight', youtubeId: 'wPM8icPu6H8', instructions: [] },
    { id: '7', name: 'Mountain Climber', bodyPart: 'Cardio', target: 'Abs', equipment: 'Bodyweight', youtubeId: 'nmwgirgXLIg', instructions: [] },
    { id: '8', name: 'Bicycle Crunch', bodyPart: 'Core', target: 'Abs', equipment: 'Bodyweight', youtubeId: 'IwyvZENru84', instructions: [] },
    { id: '9', name: 'Leg Raise', bodyPart: 'Core', target: 'Abs', equipment: 'Bodyweight', youtubeId: 'JB2oyawG9KI', instructions: [] },
    { id: '10', name: 'Jumping Jack', bodyPart: 'Cardio', target: 'Full Body', equipment: 'Bodyweight', youtubeId: 'iSSAk4XCsRA', instructions: [] },
    { id: '11', name: 'Wall Sit', bodyPart: 'Legs', target: 'Quadriceps', equipment: 'Bodyweight', youtubeId: '-cdph8zf0j0', instructions: [] },
    { id: '12', name: 'Tricep Dip (Chair)', bodyPart: 'Arms', target: 'Triceps', equipment: 'Bodyweight', youtubeId: '0326dy_-CzM', instructions: [] },
    { id: '13', name: 'Superman', bodyPart: 'Back', target: 'Lower Back', equipment: 'Bodyweight', youtubeId: 'z6PJMT2y8GQ', instructions: [] },
    { id: '14', name: 'High Knees', bodyPart: 'Cardio', target: 'Legs', equipment: 'Bodyweight', youtubeId: '8opcQdC-V-U', instructions: [] },
    { id: '15', name: 'Calf Raise', bodyPart: 'Legs', target: 'Calves', equipment: 'Bodyweight', youtubeId: '-M4-G8p8fmc', instructions: [] },
    { id: '16', name: 'Side Plank', bodyPart: 'Core', target: 'Obliques', equipment: 'Bodyweight', youtubeId: 'N_3XDzCKZf8', instructions: [] },
    { id: '17', name: 'Russian Twist', bodyPart: 'Core', target: 'Obliques', equipment: 'Bodyweight', youtubeId: 'wkD8rjkodUI', instructions: [] },
    { id: '18', name: 'Diamond Push Up', bodyPart: 'Arms', target: 'Triceps', equipment: 'Bodyweight', youtubeId: 'J0DnG1_S92I', instructions: [] },
    { id: '19', name: 'Reverse Lunge', bodyPart: 'Legs', target: 'Glutes', equipment: 'Bodyweight', youtubeId: 'HZYK-n4C4xE', instructions: [] },
    { id: '20', name: 'Flutter Kicks', bodyPart: 'Core', target: 'Abs', equipment: 'Bodyweight', youtubeId: 'ANVdMDaYRts', instructions: [] },
    { id: '21', name: 'Inchworm', bodyPart: 'Core', target: 'Full Body', equipment: 'Bodyweight', youtubeId: 'VSp0z7E5xoU', instructions: [] },
    { id: '22', name: 'Bear Crawl', bodyPart: 'Cardio', target: 'Full Body', equipment: 'Bodyweight', youtubeId: 'fpwgy7d3ZGU', instructions: [] },
    { id: '23', name: 'Pike Push Up', bodyPart: 'Shoulders', target: 'Delts', equipment: 'Bodyweight', youtubeId: 'sposDXWW0uk', instructions: [] },
    { id: '24', name: 'Step Up', bodyPart: 'Legs', target: 'Glutes', equipment: 'Bodyweight', youtubeId: 'dJVOHVQ4p6U', instructions: [] },
    { id: '25', name: 'Sit Up', bodyPart: 'Core', target: 'Abs', equipment: 'Bodyweight', youtubeId: 'jDwoBqPH0jk', instructions: [] },
    { id: '26', name: 'V-Up', bodyPart: 'Core', target: 'Abs', equipment: 'Bodyweight', youtubeId: '7JWnxORo9_8', instructions: [] },
    { id: '27', name: 'Donkey Kick', bodyPart: 'Legs', target: 'Glutes', equipment: 'Bodyweight', youtubeId: 'SJ1Xuz9D-ZQ', instructions: [] },
    { id: '28', name: 'Fire Hydrant', bodyPart: 'Legs', target: 'Glutes', equipment: 'Bodyweight', youtubeId: 'L8s2iO_7QNs', instructions: [] },
    { id: '29', name: 'Skaters', bodyPart: 'Cardio', target: 'Legs', equipment: 'Bodyweight', youtubeId: '4Rz6Z1e905E', instructions: [] },
    { id: '30', name: 'Good Morning', bodyPart: 'Legs', target: 'Hamstrings', equipment: 'Bodyweight', youtubeId: 'vj2w851ZHRM', instructions: [] },
];

export interface ExerciseFilters {
    bodyPart?: string;
    equipment?: string;
    target?: string;
}

export const fetchExercises = async (): Promise<Exercise[]> => {
    // Return static list to populate the UI initially
    return new Promise((resolve) => {
        setTimeout(() => resolve(POPULAR_EXERCISES), 300);
    });
};

export const searchExercises = async (
    term: string, 
    language: 'zh-TW' | 'en',
    filters?: ExerciseFilters
): Promise<Exercise[]> => {
    // If we have filters (that are not just "All"), or if it's a generic search term, we use recommendation mode.
    const hasFilters = filters && (
        (filters.bodyPart && filters.bodyPart !== 'All') ||
        (filters.equipment && filters.equipment !== 'All') ||
        (filters.target && filters.target.trim() !== '')
    );

    if (hasFilters || term.length > 0) {
        try {
            // Check if it's a specific single lookup (no filters, specific term)
            // Ideally, we treat everything as "Recommendation" now for better discovery,
            // unless the user specifically typed a known name.
            // But let's use the new recommendation engine for broad searches.
            return await recommendExercises(term, filters || {}, language);
        } catch (e) {
            console.error(e);
            return [];
        }
    }
    
    return POPULAR_EXERCISES;
};