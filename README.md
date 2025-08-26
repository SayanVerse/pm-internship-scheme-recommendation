# PM Internship Recommender

A full-stack web application that provides AI-light recommendation system for PM Internship Scheme candidates. Built with modern tech stack featuring glassmorphism design, multi-language support, and intelligent matching algorithms.

## 🌟 Features

- **Smart Matching**: Rule-based AI algorithm that matches candidates with internships based on skills, education, location, and sector preferences
- **Glassmorphism UI**: Modern, beautiful interface with transparent glass effects and soft shadows
- **Multi-language Support**: Available in English, Hindi, and Bengali with RTL-ready design
- **Mobile-First**: Responsive design optimized for low bandwidth and mobile devices
- **Guest Mode**: No registration required - users can get recommendations immediately
- **Admin Dashboard**: CSV upload and internship management for administrators
- **Real-time Recommendations**: Get 3-5 personalized internship matches instantly

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router 6** (SPA mode)
- **Tailwind CSS 3** with custom glassmorphism utilities
- **Radix UI** components with shadcn/ui
- **Framer Motion** for animations
- **Lucide React** icons

### Backend
- **Express.js** server with TypeScript
- **Prisma ORM** with SQLite (dev) / PostgreSQL (prod)
- **Zod** validation
- **CORS** enabled

### Database
- **SQLite** for development
- **PostgreSQL** (Neon/Supabase) for production
- Seeded with 25+ sample internships across sectors

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Environment Variables
Create a `.env` file with:

```env
# Database
DATABASE_URL="file:./dev.db"

# Auth (optional)
AUTH_SECRET="your-auth-secret-here"
NEXTAUTH_URL="http://localhost:8080"

# App
BASE_URL="http://localhost:8080"
```

### Setup Commands

```bash
# Install dependencies
pnpm install

# Generate Prisma client and setup database
pnpm exec prisma generate
pnpm exec prisma db push

# Seed database with sample data
pnpm exec tsx prisma/seed.ts

# Start development server
pnpm dev
```

The application will be available at `http://localhost:8080`

## 🗄️ Database Schema

### Core Models
- **User**: Basic user info and role (candidate/admin)
- **CandidateProfile**: Detailed candidate information including skills, preferences, location
- **Internship**: Internship opportunities with requirements and details
- **Skill**: Master list of skills with many-to-many relationship to internships
- **Application**: Track user applications to internships

### Sample Data
The seed script creates:
- 20+ skills across different domains
- 7 sample internships across IT, Healthcare, Agriculture, Education, and Public Admin sectors
- 1 admin user for testing

## 🧠 AI-Light Recommendation Engine

The recommendation system uses **rule-based scoring** without heavy ML dependencies:

### Scoring Algorithm (0-100 points)
1. **Skills Match (0-60 points)**: Jaccard similarity between candidate and required skills
2. **Sector Interest (0-20 points)**: Direct sector match or semantic skill-based matching
3. **Location Preference (0-15 points)**: PIN code proximity or preferred location match
4. **Inclusion Bonus (0-5 points)**: Rural candidates get bonus for Agriculture/Education/Public Admin sectors

### Location Matching
- **Remote jobs**: Get 50% of location points
- **PIN proximity**: Same first 3 digits = full points
- **Preferred locations**: City/state name matching
- **Fallback**: Small points for any location data

## 📱 User Journey

### 1. Landing Page (`/`)
- Hero section with purpose and CTAs
- Multi-language switcher
- Statistics cards
- Feature highlights

### 2. Intake Wizard (`/intake`)
**4-Step Process:**
1. **Personal Info**: Name and education level selection
2. **Education & Skills**: Major, year, skill selection with custom additions
3. **Sector Interests**: Multi-select sector preferences  
4. **Location**: PIN code, preferred locations, rural flag

### 3. Recommendations (`/recommendations`)
- Top 3-5 ranked internship matches
- Match score percentage with color coding
- Expandable "Why this match?" sections
- Quick apply buttons
- Refresh and preference adjustment options

### 4. Admin Dashboard (`/admin`)
- CSV upload for bulk internship import
- Statistics overview
- Internship management (placeholder for full CRUD)

## 🌐 API Endpoints

### Public Endpoints
- `POST /api/intake` - Save candidate profile
- `POST /api/recommend` - Get personalized recommendations
- `GET /api/internships` - List internships (with filters)
- `GET /api/internships/:id` - Get single internship details

### Admin Endpoints
- `POST /api/internships/upload` - CSV bulk upload

### Example Usage

```javascript
// Save candidate profile
const response = await fetch('/api/intake', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "John Doe",
    educationLevel: "UNDERGRADUATE",
    skills: ["JavaScript", "React"],
    sectorInterests: ["IT"],
    preferredLocations: ["Mumbai", "Remote"],
    language: "EN",
    ruralFlag: false
  })
});

// Get recommendations
const recommendations = await fetch('/api/recommend', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ profileId: "profile-id" })
});
```

## 📊 CSV Upload Format

For admin bulk uploads, use this CSV format:

```csv
title,sector,orgName,description,city,state,pin,remote,minEducation,requiredSkills,stipendMin,stipendMax,applicationUrl,deadline,active
Software Intern,IT,TechCorp,Build web apps,Bangalore,Karnataka,560001,true,UNDERGRADUATE,"JavaScript,React",15000,25000,https://apply.com,2024-12-31,true
```

**Required columns:**
- `title`, `sector`, `orgName`, `minEducation`, `requiredSkills`, `applicationUrl`, `deadline`

**Optional columns:**
- `description`, `city`, `state`, `pin`, `remote`, `stipendMin`, `stipendMax`, `active`

See `seed/internships.csv` for examples.

## 🎨 Design System

### Glassmorphism Classes
```css
.glass - Basic glass effect
.glass-card - Enhanced glass card with borders
.glass-strong - Strong glass effect for emphasis
```

### Color Palette
- **Primary Gradient**: Purple to Pink (`gradient-pm`)
- **Glass Effects**: White with opacity and backdrop-blur
- **Semantic Colors**: Success (green), Warning (yellow), Error (red)

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 400, 500, 600, 700, 800
- **Responsive**: Mobile-first approach

## 🔒 Security & Performance

- **Input Validation**: Zod schemas on all API endpoints
- **CORS**: Enabled for cross-origin requests
- **Rate Limiting**: Ready for implementation
- **Caching**: In-memory LRU cache for hot queries (ready)
- **Images**: Lazy loading with next/image equivalent
- **Bundle**: Code splitting and tree shaking enabled

## 🚀 Deployment

### Development
```bash
pnpm dev  # Starts both client and server on port 8080
```

### Production Build
```bash
pnpm build  # Builds both client and server
pnpm start  # Starts production server
```

### Cloud Deployment
This app is ready for deployment on:
- **Netlify**: Static frontend + serverless functions
- **Vercel**: Full-stack deployment
- **Railway/Render**: Traditional hosting
- **Docker**: Containerized deployment

## 📈 Future Enhancements

### Planned Features
- [ ] **Advanced Admin Dashboard**: Full CRUD operations
- [ ] **Authentication**: Email OTP / Magic links
- [ ] **Voice Assistance**: Web Speech API integration
- [ ] **PDF Export**: Recommendation reports
- [ ] **Analytics**: Usage tracking and insights
- [ ] **PWA**: Offline functionality and installability
- [ ] **Advanced Matching**: TF-IDF similarity for better recommendations

### Performance Optimizations
- [ ] **Caching**: Redis for API responses
- [ ] **CDN**: Asset optimization
- [ ] **Database**: Connection pooling and indexing
- [ ] **Monitoring**: Error tracking with Sentry

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is part of the PM Internship Scheme initiative.

## 🙋‍♂️ Support

For technical issues or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation at `/docs`

---

**Built with ❤️ for the PM Internship Scheme • Government of India Initiative**
