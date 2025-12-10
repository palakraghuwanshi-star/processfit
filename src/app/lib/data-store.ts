import type { FormValues } from '@/app/lib/schema';
import type { AnalyzeProcessOutput } from '@/ai/flows/analyze-process-with-ai';
import fs from 'fs/promises';
import path from 'path';

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
    submittedAt: Date;
    formData: FormValues;
    scores: AnalysisScores;
    flags: string[];
    aiAnalysis?: AnalyzeProcessOutput;
};

const dataDir = path.join(process.cwd(), '.data');

const ensureDir = async () => {
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
};

const getFilePath = (id: string) => path.join(dataDir, `${id}.json`);

export const saveData = async (id: string, data: AnalysisResult) => {
    await ensureDir();
    const filePath = getFilePath(id);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

export const getData = async (id: string): Promise<AnalysisResult | undefined> => {
    await ensureDir();
    const filePath = getFilePath(id);
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        // Manually parse date strings back to Date objects
        const parsedData = JSON.parse(fileContent, (key, value) => {
            if (key === 'submittedAt' && typeof value === 'string') {
                return new Date(value);
            }
            return value;
        });
        return parsedData as AnalysisResult;
    } catch (error) {
        if (isErrnoException(error) && error.code === 'ENOENT') {
            return undefined;
        }
        console.error(`Failed to read data for id: ${id}`, error);
        return undefined;
    }
};

export const updateWithAiData = async (id: string, aiAnalysis: AnalyzeProcessOutput) => {
    const existingData = await getData(id);
    if (existingData) {
        await saveData(id, { ...existingData, aiAnalysis });
    }
};

// Type guard for file system errors
function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
    return error instanceof Error && 'code' in error;
}
