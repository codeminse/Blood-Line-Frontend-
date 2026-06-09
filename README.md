# Feni Blood Line — Next.js App

A professional, SEO-optimized blood donation platform for Feni District, Bangladesh.

## 🩸 Features

- **5 Complete Pages**: Login, Register as Donor, Home, Find Donor, Profile
- **Next.js 14** with App Router + TypeScript
- **Tailwind CSS** with custom design system
- **SEO Optimized**: Metadata API, Open Graph, Twitter Cards, sitemap.xml, robots.txt
- **Responsive**: Mobile-first design, works on all screen sizes
- **Accessible**: ARIA labels, semantic HTML, keyboard navigation
- **Performance**: Lazy-loaded images, optimized fonts, minimal JS

## 🏗️ Architecture

```
feni-blood/
├── app/
│   ├── layout.tsx          # Root layout with Navbar + Footer
│   ├── page.tsx            # Home page
│   ├── globals.css         # Design system + Tailwind
│   ├── sitemap.ts          # Auto-generated sitemap
│   ├── robots.ts           # SEO robots config
│   ├── login/
│   │   └── page.tsx        # Login with Google
│   ├── register/
│   │   └── page.tsx        # Donor registration form
│   ├── find-donor/
│   │   └── page.tsx        # Clinical Donor Network
│   └── profile/
│       └── page.tsx        # User profile page
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx      # Sticky responsive navbar
│   │   └── Footer.tsx      # Footer with quick links
│   ├── home/
│   │   ├── Hero.tsx        # Hero with stats
│   │   ├── EmergencyRequests.tsx
│   │   ├── LocalHeroes.tsx
│   │   └── AboutSection.tsx
│   └── donor/
│       └── DonorCard.tsx   # Reusable donor card
└── lib/
```

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Build for production

```bash
npm run build
npm start
```

## 🎨 Design System

Colors defined in `globals.css`:
- **Primary**: `--blood-primary: #e51717`
- **Dark**: `--blood-dark: #c10e0e`
- **Light**: `--blood-light: #fff1f1`

Typography:
- **Headings**: Playfair Display (serif, elegant)
- **Body**: DM Sans (clean, readable)

## 🔌 Integrations (Next Steps)

- **Auth**: Replace Google button with `next-auth` + Google Provider
- **Database**: Add Prisma + PostgreSQL for donors
- **API Routes**: Create `/app/api/donors/route.ts`
- **Real-time**: Add Supabase for live availability updates
- **SMS**: Integrate Twilio/bKash API for emergency alerts

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Home — Hero, Emergency Requests, Local Heroes, About |
| `/login` | Sign in with Google |
| `/register` | Become a Blood Donor form |
| `/find-donor` | Search Clinical Donor Network |
| `/profile` | User profile & availability management |

## 🌐 Deployment

Deploy instantly to Vercel:

```bash
npx vercel
```

Set your production URL in:
- `app/layout.tsx` → `metadataBase`
- `app/sitemap.ts` → `baseUrl`
- `app/robots.ts` → `sitemap`

## 📄 License

© 2026 Feni Blood Line. All rights reserved.
