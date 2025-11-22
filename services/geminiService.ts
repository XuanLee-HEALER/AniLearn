
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { LearningDay, LearningStatus, Task, Language, LearningPlan } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const linkSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    label: { type: Type.STRING },
    url: { type: Type.STRING }
  }
};

const taskSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    description: { type: Type.STRING },
    isCompleted: { type: Type.BOOLEAN },
    estimatedMinutes: { type: Type.INTEGER },
    links: { type: Type.ARRAY, items: linkSchema },
    verificationQuestion: { type: Type.STRING, description: "A specific technical question to test the user's understanding of this task." }
  },
  required: ["id", "description", "estimatedMinutes", "verificationQuestion"],
};

const daySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    dayNumber: { type: Type.INTEGER },
    topic: { type: Type.STRING },
    summary: { type: Type.STRING },
    tasks: {
      type: Type.ARRAY,
      items: taskSchema,
    },
  },
  required: ["dayNumber", "topic", "summary", "tasks"],
};

const planSchema: Schema = {
  type: Type.ARRAY,
  items: daySchema,
};

export const generateDetailedPlan = async (
    topic: string, 
    userContext: string, 
    totalDays: number = 14, 
    language: Language = 'en'
): Promise<LearningPlan> => {
  try {
    const langInstruction = language === 'zh' ? "Respond in Chinese (Simplified)." : "Respond in English.";

    const prompt = `
      You are a friendly, encouraging anime-style tutor.
      User Goal: Learn "${topic}".
      Context/Constraints: ${userContext}
      Time per day: 2 hours.
      
      Please generate a detailed ${totalDays}-day learning plan.
      ${langInstruction}
      
      CRITICAL INSTRUCTION: 
      For each task, provide:
      1. A specific "verificationQuestion" that the user must answer to prove they learned it.
      2. Useful "links" (use real, high-quality documentation URLs or tutorial search terms).
      
      Output strictly valid JSON matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: planSchema,
        systemInstruction: `You are an expert tutor and anime character. ${langInstruction}`,
      },
    });

    const rawText = response.text;
    if (!rawText) throw new Error("No response from AI");

    const rawDays = JSON.parse(rawText) as any[];

    const days: LearningDay[] = rawDays.map((day) => ({
      ...day,
      status: day.dayNumber === 1 ? LearningStatus.PENDING : LearningStatus.LOCKED,
      isCompleted: false,
      tasks: day.tasks.map((t: any) => ({
        ...t, 
        isCompleted: false,
        userAnswer: '',
        aiFeedback: '',
        isVerified: false
      }))
    }));

    return {
        id: crypto.randomUUID(),
        title: topic,
        topic: topic,
        totalDays,
        createdAt: new Date().toISOString(),
        progress: 0,
        days,
        context: userContext
    };

  } catch (error) {
    console.error("Failed to generate plan:", error);
    throw error;
  }
};

export const generateDailyRecap = async (day: LearningDay, language: Language = 'en'): Promise<string> => {
    try {
        const langInstruction = language === 'zh' ? "Respond in Chinese (Simplified)." : "Respond in English.";
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `The user just finished studying: ${day.topic}. The summary was: ${day.summary}. 
            Give them a short, 2-sentence enthusiastic anime-style congratulation. ${langInstruction}`,
        });
        return response.text || "Great job! Keep going!";
    } catch (e) {
        return "Mission Complete! You are getting stronger!";
    }
};

export const validateUserAnswer = async (question: string, answer: string, language: Language = 'en'): Promise<{correct: boolean, feedback: string}> => {
  try {
    const langInstruction = language === 'zh' ? "Respond in Chinese (Simplified)." : "Respond in English.";
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Question: ${question}
        User Answer: ${answer}
        
        Act as a strict but encouraging anime tutor.
        1. Determine if the answer is basically correct.
        2. Provide short feedback (max 2 sentences).
        ${langInstruction}
      `,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            correct: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING }
          }
        }
      }
    });
    
    const result = JSON.parse(response.text);
    return result;
  } catch (e) {
    return { correct: true, feedback: "I couldn't verify that right now, but I trust you!" };
  }
};
