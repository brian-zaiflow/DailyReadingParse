import { DailyReadings } from '../../../shared/schema';

const CORS_PROXY = 'https://api.allorigins.win/get?url=';
const OCA_URL = 'https://www.oca.org/readings';

export interface Reading {
  id: string;
  title: string;
  url: string;
  readingType?: string;
  completed: boolean;
}

export interface DailyReadingsData {
  date: string;
  feastDay?: string;
  readings: Reading[];
}

function generateReadingId(title: string, url: string): string {
  return btoa(`${title}-${url}`).replace(/[+/=]/g, '');
}

function categorizeReading(title: string): string {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('matthew') || 
      lowerTitle.includes('mark') || 
      lowerTitle.includes('luke') || 
      lowerTitle.includes('john')) {
    return 'Gospel';
  }
  
  if (lowerTitle.includes('romans') || 
      lowerTitle.includes('corinthians') || 
      lowerTitle.includes('galatians') || 
      lowerTitle.includes('ephesians') || 
      lowerTitle.includes('philippians') || 
      lowerTitle.includes('colossians') || 
      lowerTitle.includes('thessalonians') || 
      lowerTitle.includes('timothy') || 
      lowerTitle.includes('titus') || 
      lowerTitle.includes('philemon') || 
      lowerTitle.includes('hebrews') || 
      lowerTitle.includes('james') || 
      lowerTitle.includes('peter') || 
      lowerTitle.includes('john') || 
      lowerTitle.includes('jude') || 
      lowerTitle.includes('revelation') ||
      lowerTitle.includes('acts')) {
    return 'Epistle';
  }
  
  if (lowerTitle.includes('wisdom') || lowerTitle.includes('vespers')) {
    return 'Vespers';
  }
  
  return '';
}

async function scrapeOCAReadings(): Promise<{feastDay: string; readings: Array<{title: string; url: string; readingType: string}>}> {
  try {
    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(OCA_URL)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const html = data.contents;
    
    // Parse HTML using DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract feast day information
    const h2Element = doc.querySelector('h2');
    const feastDay = h2Element?.textContent?.trim().replace(/^.*?—\s*/, '').trim() || '';
    
    // Extract readings from the list
    const readings: Array<{title: string; url: string; readingType: string}> = [];
    const links = doc.querySelectorAll('section ul li a');
    
    links.forEach(link => {
      const title = link.textContent?.trim();
      const href = link.getAttribute('href');
      
      if (title && href) {
        const url = href.startsWith('http') ? href : `https://www.oca.org${href}`;
        const readingType = categorizeReading(title);
        
        readings.push({
          title,
          url,
          readingType,
        });
      }
    });
    
    return {
      feastDay,
      readings,
    };
    
  } catch (error) {
    console.error("Error scraping OCA website:", error);
    throw new Error("Failed to fetch readings from OCA website. Please check your internet connection and try again.");
  }
}

function getStorageKey(date: string): string {
  return `oca-readings-${date}`;
}

function getProgressKey(date: string): string {
  return `oca-progress-${date}`;
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export async function getTodayReadings(): Promise<DailyReadingsData> {
  const today = getTodayString();
  const storageKey = getStorageKey(today);
  const progressKey = getProgressKey(today);
  
  // Check if we have cached data for today
  const cachedData = localStorage.getItem(storageKey);
  const progress = JSON.parse(localStorage.getItem(progressKey) || '{}');
  
  if (cachedData) {
    const parsed = JSON.parse(cachedData);
    // Apply progress to readings
    const readingsWithProgress = parsed.readings.map((reading: any) => ({
      ...reading,
      completed: progress[reading.id] || false,
    }));
    
    return {
      ...parsed,
      readings: readingsWithProgress,
    };
  }
  
  // Fetch new data
  const scrapedData = await scrapeOCAReadings();
  
  // Create readings with unique IDs
  const readings = scrapedData.readings.map(reading => ({
    id: generateReadingId(reading.title, reading.url),
    title: reading.title,
    url: reading.url,
    readingType: reading.readingType,
    completed: false,
  }));
  
  // Remove duplicates based on title and URL
  const uniqueReadings = readings.filter((reading, index, self) =>
    index === self.findIndex(r => r.title === reading.title && r.url === reading.url)
  );
  
  const dailyReadings: DailyReadingsData = {
    date: today,
    feastDay: scrapedData.feastDay,
    readings: uniqueReadings,
  };
  
  // Cache the data
  localStorage.setItem(storageKey, JSON.stringify({
    date: today,
    feastDay: scrapedData.feastDay,
    readings: uniqueReadings,
  }));
  
  return dailyReadings;
}

export function updateReadingProgress(readingId: string, completed: boolean): void {
  const today = getTodayString();
  const progressKey = getProgressKey(today);
  
  const progress = JSON.parse(localStorage.getItem(progressKey) || '{}');
  progress[readingId] = completed;
  
  localStorage.setItem(progressKey, JSON.stringify(progress));
}