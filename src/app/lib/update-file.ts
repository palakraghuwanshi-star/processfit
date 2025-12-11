'use server';

import fs from 'fs/promises';
import path from 'path';

/**
 * Updates the content of a file in the project directory.
 * IMPORTANT: This is a simplified function for demonstration purposes in a trusted environment.
 * In a real-world, multi-user production scenario, this approach would be a major security risk.
 * File system access from a server should be heavily restricted and validated.
 */
export async function updateFile(filePath: string, content: string): Promise<void> {
  // Basic validation to prevent path traversal attacks
  if (filePath.includes('..') || !filePath.startsWith('src/')) {
    throw new Error('Invalid file path.');
  }

  const absolutePath = path.join(process.cwd(), filePath);
  
  try {
    await fs.writeFile(absolutePath, content, 'utf-8');
  } catch (error) {
    console.error(`Failed to write to file: ${absolutePath}`, error);
    throw new Error(`Could not update file: ${filePath}`);
  }
}
