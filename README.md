# Cleaning Management System

Event-driven cleaning management system for vacation rental properties using Google Sheets as database and React frontend.

## 🏗️ Architecture

- **Frontend**: React + Vite (deployed on GitHub Pages)
- **Backend**: Google Apps Script (serverless)
- **Database**: Google Sheets (5 sheets for data storage)
- **Admin Interface**: Google Sheets (Madi manages directly)
- **Cleaner Interface**: React web app (mobile-optimized)

## ✨ Features

### For Cleaners:

- 📱 Mobile-optimized interface
- 🔐 Phone-based authentication
- ✅ Task confirmation/rejection system
- 🕐 Propose alternative times
- 📹 Video recording (start/end states)
- ⏱️ Time tracking with automatic duration
- 🧽 Product requesting during cleaning
- 📝 Comments and notes

### For Admin (Madi):

- 📊 Direct Google Sheets management
- 📅 Task assignment and tracking
- 👥 Cleaner management
- 📦 Product inventory control
- 📈 Monthly reports and analytics
- 💰 Automatic payment calculations
- 📱 WhatsApp integration for notifications

## 🚀 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
├── src/
│   ├── components/      # React components
│   ├── services/        # API service
│   └── App.jsx          # Main app
├── apps-script/         # Google Apps Script backend
├── seed-data/          # Sample data for sheets
└── .github/workflows/  # Auto-deployment
```

## 🔧 Deployment

The app automatically deploys to GitHub Pages when changes are pushed to main branch.

**Live URL:** <https://tino-q.github.io/ssonsoles-tasks/>

## 📄 License

MIT License

Status Flow: Admin creates task: CREATED → ASSIGNED Cleaner responds: ASSIGNED → CONFIRMED/REJECTED/TENTATIVE Task execution: CONFIRMED → STARTED → IN_PROGRESS → COMPLETED Admin review: COMPLETED → VERIFIED → CLOSED
