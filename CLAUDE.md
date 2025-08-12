# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Frontend-only Daily Scripture Readings app for Orthodox Christians that scrapes current day readings from OCA.org using a CORS proxy. Provides a simple checklist interface with persistent progress tracking via localStorage. The app focuses exclusively on today's readings without date browsing complexity and can be deployed to GitHub Pages.

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (static files)
- `npm run preview` - Preview production build locally
- `npm run check` - Run TypeScript type checking

## Architecture

### Frontend-Only Structure
- `client/` - React frontend source code
- `dist/` - Production build output (created by build command)
- `.github/workflows/` - GitHub Pages deployment automation

### Key Technologies
- **Frontend**: React 18, TypeScript, Vite, Wouter (routing), shadcn/ui + Radix UI
- **Data Fetching**: Native fetch API with CORS proxy (allorigins.win)
- **Storage**: Browser localStorage for progress tracking and data caching
- **Styling**: Tailwind CSS with shadcn/ui components
- **Deployment**: GitHub Pages with automated workflows

### Path Aliases
- `@/` → `client/src/`

### Data Flow
1. Frontend checks localStorage cache for today's readings
2. If not cached, fetches from OCA.org via CORS proxy (allorigins.win)
3. HTML parsed using native DOMParser API
4. Readings cached in localStorage with today's date
5. Progress tracking stored separately in localStorage per reading ID + date

### Storage Strategy
- **Reading Data**: localStorage with key `oca-readings-YYYY-MM-DD`
- **Progress Data**: localStorage with key `oca-progress-YYYY-MM-DD`
- Automatic cache per day - fetches fresh data each day
- Deduplication prevents duplicate scripture entries
- Progress persisted across browser sessions

### Web Scraping Details
- Uses `https://api.allorigins.win/get?url=` as CORS proxy
- Scrapes https://www.oca.org/readings for current day
- Parses HTML using browser's native DOMParser
- Extracts feast day information from `h2` elements
- Categorizes readings as Gospel, Epistle, or Vespers based on title content
- Handles relative URLs by prefixing with OCA domain

### State Management
- React useState and useEffect for local state
- localStorage for persistent data and progress
- Real-time UI updates when progress changes
- No external state management libraries needed

### Error Handling
- Network error recovery with retry functionality
- Fallback for CORS proxy failures
- User-friendly error messages for connection issues
- Graceful handling of malformed OCA.org HTML

### Deployment
- Configured for GitHub Pages deployment
- GitHub Actions workflow auto-deploys on push to main branch
- Static build with relative paths for subdirectory hosting