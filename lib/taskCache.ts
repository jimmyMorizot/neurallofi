import { promises as fs } from 'fs';
import path from 'path';
import type { GenerationStatus, MusicStyle } from '@/types';

const CACHE_DIR = path.join(process.cwd(), '.cache');
const TASKS_FILE = path.join(CACHE_DIR, 'tasks.json');

export interface TaskData {
  status: GenerationStatus;
  style: MusicStyle;
  progress?: string;
  files?: { url: string; version: number }[];
  error?: string;
  createdAt: string;
  musicGptTaskId?: string;
  conversionId1?: string;
  conversionId2?: string;
}

type TaskStore = Record<string, TaskData>;

// In-memory backup to handle race conditions in serverless
let memoryCache: TaskStore = {};
let memoryCacheLoaded = false;

/**
 * Ensure cache directory exists
 */
async function ensureCacheDir(): Promise<void> {
  try {
    await fs.access(CACHE_DIR);
  } catch {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    console.log('[TaskCache] Created cache directory:', CACHE_DIR);
  }
}

/**
 * Read all tasks from cache file with memory fallback
 */
async function readTasks(): Promise<TaskStore> {
  try {
    await ensureCacheDir();
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    const tasks = JSON.parse(data);
    // Sync memory cache
    memoryCache = { ...memoryCache, ...tasks };
    memoryCacheLoaded = true;
    return tasks;
  } catch {
    // If file doesn't exist or is corrupted, return memory cache
    if (memoryCacheLoaded) {
      return { ...memoryCache };
    }
    return {};
  }
}

/**
 * Write tasks to cache file with atomic write
 */
async function writeTasks(tasks: TaskStore): Promise<void> {
  try {
    await ensureCacheDir();
    // Update memory cache first (always succeeds)
    memoryCache = { ...tasks };
    memoryCacheLoaded = true;
    // Atomic write: write to temp file, then rename
    const tempFile = TASKS_FILE + '.tmp';
    await fs.writeFile(tempFile, JSON.stringify(tasks, null, 2));
    await fs.rename(tempFile, TASKS_FILE);
  } catch (error) {
    console.error('[TaskCache] Failed to write tasks file:', error);
    // Memory cache is still updated, so reads will work
  }
}

/**
 * Get a task by ID (checks memory first, then file)
 */
export async function getTask(taskId: string): Promise<TaskData | null> {
  // Check memory cache first (faster, avoids file I/O)
  if (memoryCacheLoaded && memoryCache[taskId]) {
    return memoryCache[taskId];
  }

  // Try to read from file
  const tasks = await readTasks();
  return tasks[taskId] || null;
}

/**
 * Set a task (creates or replaces)
 */
export async function setTask(taskId: string, data: TaskData): Promise<void> {
  console.log('[TaskCache] setTask:', taskId, data.status);

  // Update memory cache immediately
  memoryCache[taskId] = data;
  memoryCacheLoaded = true;

  // Then persist to file
  const tasks = await readTasks();
  tasks[taskId] = data;
  await writeTasks(tasks);
}

/**
 * Update a task (merge with existing data, uses memory if file fails)
 */
export async function updateTask(taskId: string, updates: Partial<TaskData>): Promise<void> {
  const tasks = await readTasks();

  if (tasks[taskId]) {
    tasks[taskId] = { ...tasks[taskId], ...updates };
  } else if (memoryCache[taskId]) {
    // Task exists in memory but not in file (race condition)
    tasks[taskId] = { ...memoryCache[taskId], ...updates };
    console.log('[TaskCache] Recovered task from memory:', taskId);
  } else {
    console.warn('[TaskCache] Task not found for update:', taskId);
    return;
  }

  // Update memory cache
  memoryCache[taskId] = tasks[taskId];
  await writeTasks(tasks);
}

/**
 * Delete old tasks (older than 1 hour)
 */
export async function cleanupOldTasks(): Promise<void> {
  const tasks = await readTasks();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  for (const [taskId, task] of Object.entries(tasks)) {
    if (new Date(task.createdAt) < oneHourAgo) {
      delete tasks[taskId];
      delete memoryCache[taskId];
    }
  }

  await writeTasks(tasks);
}
