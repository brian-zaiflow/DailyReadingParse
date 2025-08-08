import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const readings = pgTable("readings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  readingType: text("reading_type"),
  feastDay: text("feast_day"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const readingProgress = pgTable("reading_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  readingId: text("reading_id").notNull(),
  date: text("date").notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
});

export const insertReadingSchema = createInsertSchema(readings).omit({
  id: true,
  createdAt: true,
});

export const insertProgressSchema = createInsertSchema(readingProgress).omit({
  id: true,
});

export type InsertReading = z.infer<typeof insertReadingSchema>;
export type Reading = typeof readings.$inferSelect;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type ReadingProgress = typeof readingProgress.$inferSelect;

// Additional types for the frontend
export const dailyReadingsSchema = z.object({
  date: z.string(),
  feastDay: z.string().optional(),
  readings: z.array(z.object({
    id: z.string(),
    title: z.string(),
    url: z.string(),
    readingType: z.string().optional(),
    completed: z.boolean().default(false),
  })),
});

export type DailyReadings = z.infer<typeof dailyReadingsSchema>;
