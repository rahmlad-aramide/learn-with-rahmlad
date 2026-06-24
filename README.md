# Learning Hub

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/rahmladaramides-projects/v0-learning-resources-website)


Learning Hub is a modern, feature-rich learning management system built with React, TypeScript, Tailwind CSS, and Supabase. It provides a seamless learning experience with course management, video integration, progress tracking, and role-based access control.

## Features

- **Comprehensive Course Management**: Create and manage courses with detailed module and lesson structures.
- **Video Integration**: Seamlessly embed and manage video lessons from various sources.
- **Progress Tracking**: Track user progress through courses and modules.
- **User Management**: Role-based access control for students, instructors, and admins.
- **Responsive Design**: Beautiful, responsive UI built with Tailwind CSS.
- **Modern Authentication**: Secure authentication powered by Supabase.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase
- **Styling**: Tailwind CSS
- **Icons**: Lucide React, Lucide Icons SVG
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (or yarn/pnpm)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd learn-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

## Usage

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production build
npm run start
```

### Scripts

| Script | Description |
|--------|-------------|
| `dev` | Starts the development server |
| `build` | Builds the application for production |
| `start` | Runs the production build |
| `lint` | Runs ESLint to check for code quality issues |
| `lint:fix` | Fixes ESLint issues automatically |

## Directory Structure

```
src/
├── app/                # Next.js app directory
│   ├── (auth)/        # Authentication routes
│   ├── (dashboard)/   # Dashboard routes
│   └── (main)/        # Main application routes
├── components/         # Reusable React components
│   ├── ui/             # UI primitive components
│   ├── dashboard/      # Dashboard-specific components
│   └── layout/         # Layout components
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and Supabase integration
├── types/              # TypeScript type definitions
└── assets/             # Static assets
```

## Supabase Integration

This application uses Supabase for backend services:
- **Authentication**: User signup, login, and session management
- **Database**: Course, module, and user data storage
- **Storage**: File and asset management

Ensure your Supabase database is properly configured with the necessary tables and schemas before running the application.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
