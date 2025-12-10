
'use client';

import type { FormValues } from '@/app/lib/schema';
import type { AnalyzeProcessOutput } from '@/ai/flows/analyze-process-with-ai';
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp, Timestamp, collectionGroup, getDocs, query } from 'firebase/firestore';
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
        // Convert Firestore Timestamp to JS Date
        const submittedAt = data.submittedAt instanceof Timestamp ? data.submittedAt.toDate() : new Date();
        return { ...data, id: docSnap.id, submittedAt } as AnalysisResult;
    } else {
        // Check if we can get it via a collection group query as an admin might
        const q = query(collectionGroup(db, 'assessments'));
        const querySnapshot = await getDocs(q);
        const docFound = querySnapshot.docs.find(d => d.id === id);
        if (docFound && docFound.exists()) {
            const data = docFound.data();
            const submittedAt = data.submittedAt instanceof Timestamp ? data.submittedAt.toDate() : new Date();
            return { ...data, id: docFound.id, submittedAt } as AnalysisResult;
        }
    }
    return undefined;
};


export const updateAssessmentWithAiData = async (userId: string, id: string, aiAnalysis: AnalyzeProcessOutput) => {
    const db = getDb();
    const docRef = doc(db, 'users', userId, 'assessments', id);
    await updateDoc(docRef, {
        aiAnalysis
    });
};

export const getAllAssessments = async (): Promise<AnalysisResult[]> => {
    const db = getDb();
    const assessmentsRef = collectionGroup(db, 'assessments');
    const q = query(assessmentsRef);
    const querySnapshot = await getDocs(q);
    
    const assessments: AnalysisResult[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const submittedAt = data.submittedAt instanceof Timestamp ? data.submittedAt.toDate() : new Date();
        assessments.push({ ...data, id: doc.id, submittedAt } as AnalysisResult);
    });

    // Sort by most recent
    assessments.sort((a, b) => {
        const dateA = a.submittedAt instanceof Date ? a.submittedAt.getTime() : (a.submittedAt as Timestamp).toMillis();
        const dateB = b.submittedAt instanceof Date ? b.submittedAt.getTime() : (b.submittedAt as Timestamp).toMillis();
        return dateB - dateA;
    });

    return assessments;
}
