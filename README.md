# Hira Lite

A personal Jira-like project management application built with Next.js 14, MongoDB, and Tailwind CSS.
Designed for simplicity and speed.

## Features

- **Projects**: Create and manage projects with custom keys.
- **Kanban Board**: Drag and drop tasks between statuses (Todo, In Progress, Done).
- **Issues**: Create tasks, bugs, and stories with priorities.
- **Authentication**: Secure email/password login.
- **Dark Mode**: Fully supported using shadcn/ui and tailwind.
- **Optimistic UI**: Instant feedback on drag-and-drop operations.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB (Mongoose)
- **Auth**: NextAuth.js (Credentials Provider)
- **Styling**: Tailwind CSS + shadcn/ui
- **State/Data**: React Query + Server Actions
- **Drag & Drop**: @dnd-kit

## Getting Started

1. **Clone the repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Copy `.env.example` to `.env.local` or `.env` and fill in the values.
   ```bash
   MONGODB_URI=mongodb://localhost:27017/jira-lite
   NEXTAUTH_IN_MEMORY=true # Optional
   NEXTAUTH_SECRET=your_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open http://localhost:3000**

## Vercel Link:
https://hira-div4.vercel.app/
