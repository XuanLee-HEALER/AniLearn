
import { LearningPlan, LearningPlanMetadata } from '../types';

const INDEX_KEY = 'anilearn_index';
const PLAN_PREFIX = 'anilearn_plan_';

/**
 * Storage Service Adapter
 * Designed to be easily swapped with @capacitor/filesystem or @capacitor/preferences
 * Currently uses localStorage (wrapped in Promises) for Web Preview.
 */

// Helper to simulate async delay (optional, for realism)
const asyncOp = <T>(data: T): Promise<T> => Promise.resolve(data);

export const savePlan = async (plan: LearningPlan): Promise<void> => {
    try {
        // 1. Save the full content
        localStorage.setItem(`${PLAN_PREFIX}${plan.id}`, JSON.stringify(plan));

        // 2. Update the index
        const index = await getPlanIndex();
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
        console.error("Storage save failed", e);
        throw e;
    }
};

export const getPlanIndex = async (): Promise<LearningPlanMetadata[]> => {
    try {
        const data = localStorage.getItem(INDEX_KEY);
        return asyncOp(data ? JSON.parse(data) : []);
    } catch (e) {
        return [];
    }
};

export const loadPlan = async (id: string): Promise<LearningPlan | null> => {
    try {
        const data = localStorage.getItem(`${PLAN_PREFIX}${id}`);
        return asyncOp(data ? JSON.parse(data) : null);
    } catch (e) {
        return null;
    }
};

export const deletePlan = async (id: string): Promise<void> => {
    try {
        localStorage.removeItem(`${PLAN_PREFIX}${id}`);
        const index = await getPlanIndex();
        const newIndex = index.filter(p => p.id !== id);
        localStorage.setItem(INDEX_KEY, JSON.stringify(newIndex));
    } catch (e) {
        console.error("Delete failed", e);
    }
};
