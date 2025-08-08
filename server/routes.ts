import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import axios from "axios";
import * as cheerio from "cheerio";
import { insertReadingSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Fetch and parse OCA readings for current day
  app.get("/api/readings/today", async (req, res) => {
    try {
      const today = new Date();
      const date = today.toISOString().split('T')[0];
      
      // Try to get from storage first
      let dailyReadings = await storage.getDailyReadingsWithProgress(date);
      
      // If no readings in storage, scrape from OCA
      if (dailyReadings.readings.length === 0) {
        const scrapedData = await scrapeOCAReadingsToday();
        
        // Store scraped readings
        for (const reading of scrapedData.readings) {
          await storage.createReading({
            date,
            title: reading.title,
            url: reading.url,
            readingType: reading.readingType,
            feastDay: scrapedData.feastDay,
          });
        }
        
        // Get the updated data with progress
        dailyReadings = await storage.getDailyReadingsWithProgress(date);
      }
      
      res.json(dailyReadings);
    } catch (error) {
      console.error("Error fetching readings:", error);
      res.status(500).json({ 
        message: "Failed to fetch readings. Please check your internet connection and try again." 
      });
    }
  });

  // Update reading progress
  app.post("/api/readings/today/progress", async (req, res) => {
    try {
      const today = new Date();
      const date = today.toISOString().split('T')[0];
      const { readingId, completed } = req.body;
      
      if (!readingId || typeof completed !== 'boolean') {
        return res.status(400).json({ message: "Invalid request body" });
      }

      const progress = await storage.updateProgress(readingId, date, completed);
      res.json(progress);
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Failed to update reading progress" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function scrapeOCAReadingsToday() {
  // Use the simpler current day URL
  const url = `https://www.oca.org/readings`;
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000,
    });
    
    const $ = cheerio.load(response.data);
    
    // Extract feast day/saint information
    const feastDay = $('h2').first().text().trim() || '';
    
    // Extract readings from the list
    const readings: Array<{title: string, url: string, readingType?: string}> = [];
    
    $('section ul li a').each((_, element) => {
      const $link = $(element);
      const title = $link.text().trim();
      const href = $link.attr('href');
      
      if (title && href) {
        // Determine reading type based on content
        let readingType = '';
        if (title.toLowerCase().includes('matthew') || 
            title.toLowerCase().includes('mark') || 
            title.toLowerCase().includes('luke') || 
            title.toLowerCase().includes('john')) {
          readingType = 'Gospel';
        } else if (title.toLowerCase().includes('romans') || 
                   title.toLowerCase().includes('corinthians') || 
                   title.toLowerCase().includes('galatians') || 
                   title.toLowerCase().includes('ephesians') || 
                   title.toLowerCase().includes('philippians') || 
                   title.toLowerCase().includes('colossians') || 
                   title.toLowerCase().includes('thessalonians') || 
                   title.toLowerCase().includes('timothy') || 
                   title.toLowerCase().includes('titus') || 
                   title.toLowerCase().includes('philemon') || 
                   title.toLowerCase().includes('hebrews') || 
                   title.toLowerCase().includes('james') || 
                   title.toLowerCase().includes('peter') || 
                   title.toLowerCase().includes('john') || 
                   title.toLowerCase().includes('jude') || 
                   title.toLowerCase().includes('revelation') ||
                   title.toLowerCase().includes('acts')) {
          readingType = 'Epistle';
        } else if (title.toLowerCase().includes('wisdom') || 
                   title.toLowerCase().includes('vespers')) {
          readingType = 'Vespers';
        }
        
        readings.push({
          title,
          url: href.startsWith('http') ? href : `https://www.oca.org${href}`,
          readingType,
        });
      }
    });
    
    return {
      feastDay: feastDay.replace(/^.*?—\s*/, '').trim(), // Clean up feast day text
      readings,
    };
    
  } catch (error) {
    console.error("Error scraping OCA website:", error);
    throw new Error("Failed to fetch readings from OCA website");
  }
}
