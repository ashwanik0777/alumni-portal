# Alumni Portal

A modern portal aimed at connecting and engaging with alumni, built with the latest web technologies.

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Directory)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

## 🎨 Theme & Design System

The application features a comprehensive styling system built on CSS variables and Tailwind CSS, supporting both Light and Dark modes.

### Color Palette

| Role | Variable | Light Mode Color | Dark Mode Color | Usage |
|------|----------|------------------|-----------------|-------|
| **Primary** | `--color-primary` | `#1E348A` (Royal Blue) | `#93C5FD` (Light Blue) | Main actions, brand headers |
| **Secondary** | `--color-secondary` | `#C9A227` (Gold) | `#C9A227` (Gold) | Highlights, success states |
| **Accent** | `--color-accent` | `#93C5FD` (Sky Blue) | `#FAF996` (Pale Yellow) | Subtle highlights, decorations |
| **Background** | `--color-bg` | `#F8F9F4` (Off-White) | `#1F2957` (Deep Blue) | Main page background |
| **Card** | `--color-card` | `#FFFFFF` (White) | `#1E348A` (Royal Blue) | Surface elements, modals |

### Using Icons
We use **Lucide React** for iconography.
```tsx
import { User, Bell } from 'lucide-react';

<User className="h-4 w-4 text-primary" />
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
