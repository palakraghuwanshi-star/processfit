
'use client';

import type { FormValues } from '@/app/lib/schema';
import type { AnalyzeProcessOutput } from '@/ai/flows/analyze-process-with-ai';
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

export type AnalysisScores = {
    volumeScale: number;
    costEfficiency: number;
    riskCompliance: number;
    feasibility: number;
    strategicImpact: number;
    businessImpact: number;
    totalScore: number;
    category: string;
    color: string;
};

export type AnalysisResult = {
    id: string;
    submittedAt: Date | Timestamp;
    formData: FormValues;
    scores: AnalysisScores;
    flags: string[];
    aiAnalysis?: AnalyzeProcessOutput;
};

const getDb = () => {
    const { firestore } = initializeFirebase();
    return firestore;
}

export const saveAssessment = async (userId: string, id: string, data: Omit<AnalysisResult, 'id'>) => {
    const db = getDb();
    const docRef = doc(db, 'users', userId, 'assessments', id);
    await setDoc(docRef, {
        ...data,
        id, // ensure id is part of the document data
        submittedAt: serverTimestamp() // Use server-side timestamp
    });
};

export const getAssessment = async (userId: string, id: string): Promise<AnalysisResult | undefined> => {
    const db = getDb();
    const docRef = doc(db, 'users', userId, 'assessments', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        const submittedAt = data.submittedAt instanceof Timestamp ? data.submittedAt.toDate() : new Date();
        return { ...data, id: docSnap.id, submittedAt } as AnalysisResult;
    } else {
        return undefined;
    }
};

export const updateAssessmentWithAiData = async (userId: string, id: string, aiAnalysis: AnalyzeProcessOutput) => {
    const db = getDb();
    const docRef = doc(db, 'users', userId, 'assessments', id);
    await updateDoc(docRef, {
        aiAnalysis
    });
};
