
'use client';

import type { FormValues } from '@/app/lib/schema';
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp, Timestamp, collectionGroup, getDocs, query } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter }from '@/firebase/error-emitter';

export type AnalysisScores = {
    volumeScale: number;
    costEfficiency: number;
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
};

const getDb = () => {
    const { firestore } = initializeFirebase();
    return firestore;
}

/**
 * Recursively cleans an object by replacing `undefined` values with `null`.
 * Firestore does not support `undefined`.
 * @param obj The object to clean.
 * @returns The cleaned object.
 */
const cleanDataForFirestore = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => cleanDataForFirestore(item));
  }

  const cleanedObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      cleanedObj[key] = value === undefined ? null : cleanDataForFirestore(value);
    }
  }
  return cleanedObj;
};


export const saveAssessment = async (userId: string, id: string, data: Omit<AnalysisResult, 'id'>) => {
    const db = getDb();
    const docRef = doc(db, 'users', userId, 'assessments', id);
    
    // Clean the data before sending it to Firestore
    const cleanedData = {
        ...data,
        formData: cleanDataForFirestore(data.formData),
    };

    setDoc(docRef, {
        ...cleanedData,
        id, // ensure id is part of the document data
        submittedAt: serverTimestamp() // Use server-side timestamp
    }).catch((error) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'create',
            requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
};

export const getAssessment = async (userId: string, id: string): Promise<AnalysisResult | undefined> => {
    const db = getDb();
    const docRef = doc(db, 'users', userId, 'assessments', id);
    const docSnap = await getDoc(docRef).catch((error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        throw permissionError;
    });

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

export const getAllAssessments = async (): Promise<AnalysisResult[]> => {
    const db = getDb();
    const assessmentsRef = collectionGroup(db, 'assessments');
    const q = query(assessmentsRef);
    
    try {
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
    } catch (error) {
        const permissionError = new FirestorePermissionError({
            path: 'assessments', // This is a collection group query
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        // Re-throw the detailed error so the UI can catch it
        throw permissionError;
    }
}
