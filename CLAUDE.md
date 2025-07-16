# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a full-stack todo application with:
- **Frontend**: React + Vite app in `frontend/` directory using Tailwind CSS, React Router, and Axios
- **Backend**: Flask API in `backend/` directory with SQLAlchemy ORM and Flask-CORS
- **Database**: SQLite for development, PostgreSQL for production (via Render.com)

## Development Commands

### Frontend (from /frontend directory)
- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Backend (from /backend directory)
- `python app.py` - Run development server
- `flask db migrate` - Generate database migrations
- `flask db upgrade` - Apply database migrations
- `pip install -r requirements.txt` - Install dependencies

## Architecture Notes

### Backend Architecture
- **Main app**: `app.py` contains Flask app factory pattern with CORS configuration
- **Models**: `models.py` defines Task model with SQLAlchemy, includes recurring task support
- **Routes**: `routes.py` contains API endpoints (Blueprint registered at `/api`)
- **Config**: `config.py` handles database configuration (SQLite dev, PostgreSQL prod)
- **Notifications**: `notifications.py` handles task notification logic
- **Timezone**: Uses Brazil timezone (UTC-3) for task timestamps

### Frontend Architecture
- **Components**: Modular React components in `src/components/`
  - `TaskList.jsx` - Main task display
  - `TaskForm.jsx` - Task creation/editing
  - `TaskItem.jsx` - Individual task rendering
  - `Modal.jsx` - Reusable modal component
  - `Notifications.jsx` - Notification system
- **Services**: API calls centralized in `src/services/api.js`
- **Utils**: Date utilities and notification helpers in `src/utils/`

### Key Features
- Task CRUD operations with due dates
- Recurring tasks (daily, weekly, monthly)
- Browser notifications for due tasks
- Responsive design with Tailwind CSS
- Service Worker for offline notifications

## Deployment
- Production backend deployed on Render.com (see `render.yaml`)
- Frontend deployed on Vercel
- CORS configured for both localhost and production domains

## Database Schema
Task model includes:
- Basic fields: id, title, description, due_date, completed, created_at
- Recurring task fields: is_recurring, recurrence_type, parent_task_id
- Uses timezone-aware datetime fields