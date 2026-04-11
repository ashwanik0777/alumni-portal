# Alumni Portal

Alumni Portal is a modern community platform for JNV Farrukhabad alumni. It is designed to help alumni reconnect, discover opportunities, participate in events, and engage in mentorship through a polished, responsive, light/dark theme-ready interface.

## Overview

This project is built with the Next.js App Router and focuses on:

- Alumni networking and directory discovery
- Career opportunity showcase
- Events and reunion experiences
- Mentorship program journeys
- Support, privacy, and legal documentation pages
- Cohesive design system with custom theme variables

## Current Feature Status

Implemented pages and modules:

- Home page with feature highlights, impact metrics, testimonials, and CTA sections
- About page with mission, values, community milestones, and executive committee
- Alumni Directory page with rich listing UI and filter/search interface layout
- Events and Reunions page with featured events, timeline roadmap, and support CTA
- Career Opportunities page with featured jobs, track cards, and hiring CTA
- Mentorship Program page with tracks, process flow, and mentorship request form UI
- Alumni Registration page with full multi-field registration form UI
- Contact/Support page with support channels, SLA section, and request form UI
- Privacy Policy page
- Terms of Service page
- Shared navigation/footer and unique visitor counter

Partially implemented:

- Login page is currently under construction
- Search/filter controls and forms are currently UI-first and not yet connected to persistent backend storage

## Tech Stack

- Framework: Next.js 16 (App Router)
- Language: TypeScript
- UI: React 19
- Styling: Tailwind CSS v4 + CSS variable design tokens
- Icons: lucide-react
- Linting: ESLint 9 + eslint-config-next

## Project Structure

Key structure:

```text
app/
	about/
	api/
		counter/
			route.ts
	components/
		Footer.tsx
		Navbar.tsx
		UnderConstruction.tsx
		UniqueViewerCounter.tsx
	contact/
	demo/
	directory/
	events/
	jobs/
	login/
	mentorship/
	privacy/
	register/
	team/
	terms/
	globals.css
	layout.tsx
	page.tsx
public/
	counter.json
```

## Routes

| Route | Purpose | Status |
|---|---|---|
| / | Homepage | Implemented |
| /about | About community and leadership | Implemented |
| /directory | Alumni directory UI | Implemented |
| /events | Events and reunions | Implemented |
| /jobs | Career opportunities | Implemented |
| /mentorship | Mentorship program | Implemented |
| /register | Alumni registration | Implemented |
| /contact | Support and help request | Implemented |
| /privacy | Privacy policy | Implemented |
| /terms | Terms of service | Implemented |
| /team | Team showcase | Implemented |
| /login | Login | Under construction |
| /demo | Theme/style demo page | Implemented |
| /api/counter | Unique visitor counter API | Implemented |

## Design System and Theming

Global design tokens are defined in app/globals.css and exposed through Tailwind theme variables.

### Color Tokens

| Token | Light | Dark | Usage |
|---|---|---|---|
| --color-primary | #1E348A | #60A5FA | Primary actions, icons, highlights |
| --color-secondary | #C9A227 | #FBBF24 | Secondary accents and emphasis |
| --color-accent | #93C5FD | #38BDF8 | Supporting accent surfaces |
| --color-bg | #F8F9F4 | #0F172A | App background |
| --color-card | #FFFFFF | #1E293B | Card/surface background |
| --color-text-primary | #1F2957 | #F1F5F9 | Primary text |
| --color-text-secondary | #1E348A | #94A3B8 | Secondary text |
| --color-border | #CBD5E1 | #334155 | Border colors |

### Theme Behavior

- Theme toggle is implemented in Navbar
- Theme preference is stored in localStorage using key theme
- Root html class dark is added/removed dynamically

## Core Shared Components

- Navbar: sticky navigation, responsive mobile menu, dark/light toggle
- Footer: quick links, contact details, legal links, unique visitor counter
- UnderConstruction: fallback placeholder component for unfinished pages
- UniqueViewerCounter: fetches from /api/counter and conditionally increments once per browser

## API Documentation

### GET /api/counter

Returns unique visitor count and optionally increments count.

Query params:

- increment=true: increments counter before returning

Response:

```json
{
	"count": 1241
}
```

Implementation details:

- Counter file: public/counter.json
- Initializes with count 1240 if file does not exist
- Frontend uses localStorage key has_visited_site to avoid repeated increment from the same browser

## Setup and Run

### Prerequisites

- Node.js 20+ recommended
- npm (or pnpm/yarn/bun)

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:3000

### Production Build

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

## Scripts

Defined in package.json:

- dev: start Next.js dev server
- build: create production build
- start: run production server
- lint: run ESLint

## Engineering Rules Followed

This project uses project_rules.md as an authoritative guideline file.

Highlights:

- Use only the project CSS theme tokens for color styling
- Keep dependency footprint minimal
- Use lucide-react as the icon system
- Maintain strong responsive behavior with mobile-first layout
- Prefer clean, fast interfaces and avoid heavy UI bloat

## Known Limitations

- Most forms (registration, mentorship, contact, filters) are currently presentational and are not yet connected to a data backend
- Login/authentication flow is not yet implemented
- Some footer links point to routes that are not created yet (for example, /news, /donate, /share-story)

## Recommended Next Steps

1. Connect forms to API routes and persistent storage
2. Implement authentication and protected profile management
3. Add real search/filter logic for jobs and directory pages
4. Add admin/moderator dashboard for content and member verification
5. Add test coverage for critical user journeys

## Deployment

This application can be deployed on Vercel or any Node-compatible hosting that supports Next.js App Router.

For Vercel:

1. Import repository
2. Install dependencies
3. Build command: npm run build
4. Start command: npm run start

## Maintainers

Designed and developed by the Alumni Tech Team.
