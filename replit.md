# Daily Scripture Readings - Orthodox Church in America

## Overview

This is a full-stack web application that provides a simple, interactive checklist for daily Orthodox Christian scripture readings. The app automatically fetches today's scripture readings from the Orthodox Church in America (OCA) website and allows users to track their progress with persistent local storage.

The application scrapes current day readings from OCA.org, stores them temporarily in memory, and provides a clean, mobile-friendly interface for tracking reading completion. Progress is saved locally in the user's browser for a simple, personal experience.

## User Preferences

- **Communication style**: Simple, everyday language
- **Application scope**: Keep it simple - focus on current day readings only, no date browsing
- **Storage approach**: Local browser storage preferred over database complexity

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the user interface
- **Vite** as the build tool and development server
- **Wouter** for client-side routing (lightweight alternative to React Router)
- **TanStack Query** for server state management and API data fetching
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** component library built on Radix UI primitives
- Component-based architecture with reusable UI components

### Backend Architecture
- **Express.js** server with TypeScript
- **RESTful API** design for data operations
- **Web scraping** using Cheerio to parse HTML from OCA.org
- **In-memory storage** with interface for future database integration
- Middleware for request logging and error handling

### Data Storage
- **Drizzle ORM** configured for PostgreSQL (schema defined but using in-memory storage currently)
- **Database schema** includes:
  - `readings` table: stores scripture reading information (date, title, URL, type, feast day)
  - `reading_progress` table: tracks user completion status per reading
- **Neon Database** integration configured for PostgreSQL hosting

### API Design
- `GET /api/readings/today` - Fetches current day's readings with progress status
- `POST /api/readings/today/progress` - Updates reading completion status
- Automatic data fetching from https://www.oca.org/readings (current day)
- In-memory storage with progress tracking per individual reading item
- Simple, focused design eliminating date browsing complexity

### State Management
- **TanStack Query** for server state, caching, and background updates
- **React hooks** for local component state
- **Context API** for global UI state (toasts, tooltips)
- Query invalidation on progress updates for real-time UI updates

### Styling and UI
- **Tailwind CSS** with custom design system
- **CSS custom properties** for theming (light mode focused)
- **Responsive design** with mobile-first approach
- **shadcn/ui** components for consistent, accessible UI elements
- **Radix UI** primitives for complex interactions (dialogs, tooltips, etc.)

## External Dependencies

### Third-Party Services
- **Orthodox Church in America (OCA.org)** - Primary data source for daily scripture readings
- **Neon Database** - PostgreSQL hosting service for production data storage

### Key Libraries
- **@tanstack/react-query** - Server state management and data fetching
- **axios** - HTTP client for API requests
- **cheerio** - Server-side HTML parsing for web scraping
- **drizzle-orm** - Type-safe ORM for database operations
- **@neondatabase/serverless** - Neon database connection driver
- **wouter** - Minimal routing library for React
- **date-fns** - Date manipulation and formatting utilities

### UI and Styling
- **@radix-ui** - Accessible, unstyled UI primitives
- **tailwindcss** - Utility-first CSS framework
- **class-variance-authority** - Component variant management
- **clsx** & **tailwind-merge** - Conditional className utilities

### Development Tools
- **TypeScript** - Static typing for JavaScript
- **Vite** - Fast build tool and development server
- **ESBuild** - Fast JavaScript bundler for production builds
- **Drizzle Kit** - Database migration and schema management tools