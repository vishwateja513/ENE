# Student CRM with Coding Profiles Dashboard

A comprehensive React + TypeScript + Supabase application for managing student information and tracking coding performance across multiple platforms.

## 📋 Overview

This application centralizes student data and provides unified analytics for coding performance across LeetCode, Codeforces, CodeChef, GeeksforGeeks, and HackerRank platforms. It offers both student and admin interfaces with real-time data synchronization.

## 🚀 Features

### Student Features
- **Authentication**: Secure sign-up/login with Supabase Auth
- **Profile Management**: Complete student profile with batch and department info
- **Multi-Platform Integration**: Add coding profiles from 5 major platforms
- **Personal Dashboard**: Unified view of coding statistics and progress
- **Performance Analytics**: Interactive charts showing cross-platform performance
- **Leaderboard**: Compare rankings with peers across departments and batches

### Admin Features
- **Student Management**: View, edit, and manage all student records
- **Bulk Operations**: Refresh all profiles and export data
- **Analytics Dashboard**: Comprehensive insights into student engagement
- **Department/Batch Analytics**: Performance trends and distribution analysis
- **CSV Export**: Export student data for external analysis

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Charts**: Recharts for data visualization
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Vercel/Netlify (Frontend), Supabase (Backend)

## 📊 Database Schema

### Core Tables
- `students`: Student profiles and authentication
- `coding_profiles`: Platform-specific profile links
- `coding_stats`: Performance metrics from each platform
- `unified_scores`: Normalized scoring across platforms

### Key Features
- Row Level Security (RLS) for data protection
- Automated triggers for timestamp updates
- Performance indexes for optimized queries
- Foreign key constraints for data integrity

## 🔧 Scoring Algorithm

The unified scoring system normalizes performance across platforms using weighted calculations:

- **LeetCode** (30%): Problem difficulty + acceptance rate + contests
- **Codeforces** (25%): Rating + contest participation + problems solved
- **CodeChef** (20%): Rating + contests + problem count
- **GeeksforGeeks** (15%): Problem-focused scoring with contest bonus
- **HackerRank** (10%): Balanced approach across all metrics

## 🎨 Design System

- **Colors**: Purple-blue gradient theme with semantic color ramps
- **Typography**: Consistent font weights and line spacing
- **Spacing**: 8px base spacing system
- **Components**: Glassmorphism effects with backdrop blur
- **Animations**: Smooth transitions and micro-interactions
- **Responsive**: Mobile-first design with breakpoint optimization

## 🔐 Security

- JWT-based authentication with Supabase
- Row Level Security policies for data access control
- Admin role separation for privileged operations
- Secure API key management through environment variables

## 📱 Responsive Design

- **Mobile** (<768px): Optimized touch interface
- **Tablet** (768-1024px): Balanced layout with sidebars
- **Desktop** (>1024px): Full feature accessibility with multiple columns

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Supabase project and configure environment variables
4. Run migrations to set up database schema
5. Start development server: `npm run dev`

## 🔄 Data Synchronization

The application uses Supabase Edge Functions to fetch real-time data from coding platforms:

- Automated profile refresh capabilities
- Manual sync options for individual profiles
- Bulk refresh for admin operations
- Rate limiting and error handling for API calls

## 📈 Analytics & Reporting

- Real-time leaderboards with filtering options
- Department and batch-wise performance analysis
- Interactive charts for trend visualization
- CSV export functionality for external reporting

---

**Author**: Vishwateja Challa  
**Version**: 1.0  
**License**: MIT