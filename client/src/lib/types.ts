export interface ReadingItem {
  id: string;
  title: string;
  url: string;
  readingType?: string;
  completed: boolean;
}

export interface DailyReadingsData {
  date: string;
  feastDay?: string;
  readings: ReadingItem[];
}

export interface ProgressUpdate {
  readingId: string;
  completed: boolean;
}
