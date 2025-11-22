
import { LearningPlan, LearningPlanMetadata } from '../types';

const INDEX_KEY = 'anilearn_index';
const PLAN_PREFIX = 'anilearn_plan_';

// Save the full plan (updates both detail and index)
export const savePlan = (plan: LearningPlan) => {
    try {
        // 1. Save the full content
        localStorage.setItem(`${PLAN_PREFIX}${plan.id}`, JSON.stringify(plan));

        // 2. Update the index
        const index = getPlanIndex();
        const existingIdx = index.findIndex(p => p.id === plan.id);
        
        // Calculate progress
        const completedTasks = plan.days.flatMap(d => d.tasks).filter(t => t.isCompleted).length;
        const totalTasks = plan.days.flatMap(d => d.tasks).length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const metadata: LearningPlanMetadata = {
            id: plan.id,
            title: plan.title,
            topic: plan.topic,
            totalDays: plan.totalDays,
            createdAt: plan.createdAt || new Date().toISOString(),
            progress
        };

        if (existingIdx >= 0) {
            index[existingIdx] = metadata;
        } else {
            index.unshift(metadata); // Add to top
        }

        localStorage.setItem(INDEX_KEY, JSON.stringify(index));
    } catch (e) {
        console.error("Storage failed", e);
    }
};

export const getPlanIndex = (): LearningPlanMetadata[] => {
    try {
        const data = localStorage.getItem(INDEX_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
};

export const loadPlan = (id: string): LearningPlan | null => {
    try {
        const data = localStorage.getItem(`${PLAN_PREFIX}${id}`);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
};

export const deletePlan = (id: string) => {
    try {
        localStorage.removeItem(`${PLAN_PREFIX}${id}`);
        const index = getPlanIndex().filter(p => p.id !== id);
        localStorage.setItem(INDEX_KEY, JSON.stringify(index));
    } catch (e) {
        console.error("Delete failed", e);
    }
};
