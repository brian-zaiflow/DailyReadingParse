import { type Reading, type InsertReading, type ReadingProgress, type InsertProgress, type DailyReadings } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getReadingsByDate(date: string): Promise<Reading[]>;
  createReading(reading: InsertReading): Promise<Reading>;
  getProgressByDate(date: string): Promise<ReadingProgress[]>;
  updateProgress(readingId: string, date: string, completed: boolean): Promise<ReadingProgress>;
  getDailyReadingsWithProgress(date: string): Promise<DailyReadings>;
}

export class MemStorage implements IStorage {
  private readings: Map<string, Reading>;
  private progress: Map<string, ReadingProgress>;

  constructor() {
    this.readings = new Map();
    this.progress = new Map();
  }

  async getReadingsByDate(date: string): Promise<Reading[]> {
    const readings = Array.from(this.readings.values()).filter(
      (reading) => reading.date === date,
    );
    
    // Remove duplicates based on title and URL
    const uniqueReadings = readings.filter((reading, index, self) =>
      index === self.findIndex(r => r.title === reading.title && r.url === reading.url)
    );
    
    return uniqueReadings;
  }

  async createReading(insertReading: InsertReading): Promise<Reading> {
    // Check if reading already exists by title and URL for this date
    const existingReadings = await this.getReadingsByDate(insertReading.date);
    const duplicate = existingReadings.find(r => 
      r.title === insertReading.title && r.url === insertReading.url
    );
    
    if (duplicate) {
      return duplicate;
    }
    
    const id = randomUUID();
    const reading: Reading = { 
      ...insertReading, 
      id,
      createdAt: new Date(),
      feastDay: insertReading.feastDay || null,
      readingType: insertReading.readingType || null,
    };
    this.readings.set(id, reading);
    return reading;
  }

  async getProgressByDate(date: string): Promise<ReadingProgress[]> {
    return Array.from(this.progress.values()).filter(
      (prog) => prog.date === date,
    );
  }

  async updateProgress(readingId: string, date: string, completed: boolean): Promise<ReadingProgress> {
    const existingKey = `${readingId}-${date}`;
    const existing = Array.from(this.progress.values()).find(
      (prog) => prog.readingId === readingId && prog.date === date
    );

    if (existing) {
      existing.completed = completed;
      existing.completedAt = completed ? new Date() : null;
      return existing;
    } else {
      const id = randomUUID();
      const newProgress: ReadingProgress = {
        id,
        readingId,
        date,
        completed,
        completedAt: completed ? new Date() : null,
      };
      this.progress.set(id, newProgress);
      return newProgress;
    }
  }

  async getDailyReadingsWithProgress(date: string): Promise<DailyReadings> {
    const readings = await this.getReadingsByDate(date);
    const progress = await this.getProgressByDate(date);
    
    const progressMap = new Map(
      progress.map(p => [p.readingId, p.completed])
    );

    const readingsWithProgress = readings.map(reading => ({
      id: reading.id,
      title: reading.title,
      url: reading.url,
      readingType: reading.readingType || undefined,
      completed: progressMap.get(reading.id) || false,
    }));

    return {
      date,
      feastDay: readings[0]?.feastDay || undefined,
      readings: readingsWithProgress,
    };
  }
}

export const storage = new MemStorage();
