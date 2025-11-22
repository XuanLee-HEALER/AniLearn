
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { LearningDay, LearningStatus, Task, Language, LearningPlan, DailyRecap } from "../types";

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
    verificationQuestion: { type: Type.STRING, description: "A specific technical question to test the user's understanding." },
    answerKey: { type: Type.STRING, description: "The concise correct answer to the verification question for user self-checking." }
  },
  required: ["id", "description", "estimatedMinutes", "verificationQuestion", "answerKey"],
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

// Recap Schema
const extensionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    url: { type: Type.STRING, description: "A search query URL or specific doc URL" }
  }
};

const recapSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A summary of what was learned today." },
    extensions: { type: Type.ARRAY, items: extensionSchema, description: "2-3 advanced topics or resources related to today's learning." }
  },
  required: ["summary", "extensions"]
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
      1. A specific "verificationQuestion".
      2. A concise "answerKey" so the user can check themselves.
      3. Useful "links".
      
      Output strictly valid JSON matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: planSchema,
        systemInstruction: `You are an expert tutor. ${langInstruction}`,
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

export const generateDailyRecap = async (day: LearningDay, language: Language = 'en'): Promise<DailyRecap> => {
    try {
        const langInstruction = language === 'zh' ? "Respond in Chinese (Simplified)." : "Respond in English.";
        const prompt = `
          The user completed studying: ${day.topic}.
          Original Summary: ${day.summary}
          
          1. Write a short, encouraging summary of what they accomplished.
          2. Suggest 2-3 extension topics/resources (links or search terms) for them to go deeper (e.g. "Advanced usage of X").
          
          ${langInstruction}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: recapSchema
            }
        });
        
        const text = response.text;
        if(!text) throw new Error("No recap generated");
        return JSON.parse(text) as DailyRecap;

    } catch (e) {
        console.error(e);
        return {
            summary: "Great job completing today's tasks! Keep moving forward!",
            extensions: []
        };
    }
};
