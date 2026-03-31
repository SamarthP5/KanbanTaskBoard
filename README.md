# Kanban Task Board

A full-stack Kanban board built for the Next Play Games SDE internship assessment.


## Stack

- React 18 + TypeScript + Vite
- Supabase (PostgreSQL + anonymous auth + RLS)
- @dnd-kit for drag-and-drop

## Features

- Drag-and-drop tasks across To Do / In Progress / In Review / Done
- Guest sessions via Supabase anonymous auth — no signup required
- Create, edit, and delete tasks with title, description, priority, and due date
- Team members with color-coded avatars and task assignment
- Due date indicators (overdue highlighted in red, due today in amber)
- Search by title + filter by priority
- Board stats summary (total, in progress, done, overdue)
- Row Level Security — users only see their own data

## Local Setup

```bash
git clone https://github.com/YOUR_USERNAME/nextplay-kanban.git
cd nextplay-kanban
npm install
cp .env.example .env   # add your Supabase URL and anon key
npm run dev
```

You'll also need to run the SQL schema in your Supabase project (see `schema.sql`) and enable Anonymous auth under Authentication → Providers.

## Environment Variables

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
