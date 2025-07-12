# Implementation Plan - Cleaning Management App

## Simple Architecture
- **Google Sheets**: Database with multiple sheets
- **Apps Script**: Backend for CRUD operations
- **React + Vite**: Frontend static web app
- **Deployment**: Frontend on GitHub Pages, Backend on Apps Script Web App

## Google Sheets Structure

### Sheet 1: "reservations"
```
| A: property | B: checkin_date | C: checkout_date | D: notes |
```

### Sheet 2: "tasks" 
```
| A: id | B: property | C: type | D: date | E: status | F: cleaner | G: notes | H: start_time | I: end_time | J: comments | K: start_video | L: end_video |
```

### Sheet 3: "cleaners"
```
| A: id | B: name | C: phone | D: hourly_rate | E: active |
```

### Sheet 4: "products"
```
| A: id | B: name | C: category | D: min_stock |
```

### Sheet 5: "product_requests"
```
| A: id | B: task_id | C: product_id | D: quantity | E: request_date |
```

## Task States
- **URGENT** (red): Unassigned
- **PENDING** (yellow): Assigned, awaiting confirmation
- **CONFIRMED** (green): Confirmed by cleaner
- **REJECTED** (orange): Rejected, needs reassignment
- **TENTATIVE** (blue): Alternative time proposed

## Event-Driven Flow

### 1. Task Loading (Write-only)
- Import from reservations → generate automatic tasks
- Manual form → create new task

### 2. Assignment (Write-only)
- Admin assigns cleaner → status = PENDING
- Generate WhatsApp link

### 3. Confirmation (Write-only)
- Cleaner confirms → status = CONFIRMED
- Cleaner rejects → status = REJECTED
- Proposes time → status = TENTATIVE + suggested time

### 4. Execution (Write-only)
- Register start → start_time + start_video
- Register end → end_time + end_video + comments
- Mark missing products → new request

## Files to Create

### 1. Frontend (React + Vite)
```
frontend/
├── src/
│   ├── components/
│   │   ├── Calendar.jsx
│   │   ├── TaskCard.jsx
│   │   ├── CleanerPanel.jsx
│   │   └── AdminPanel.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

### 2. Backend (Apps Script)
```
apps-script/
├── Code.gs
├── TaskService.gs
├── CleanerService.gs
└── appsscript.json
```

### 3. Seed Data
```
seed-data/
├── reservations-sample.csv
├── cleaners-sample.csv
└── products-sample.csv
```

## Core Features

### Admin Panel
- Calendar view with filters
- Task assignment
- WhatsApp link generation
- Monthly reports

### Cleaner Panel
- View assigned tasks
- Confirm/reject tasks
- Record times and videos
- Request products

## Deployment
- **Frontend**: GitHub Pages (React + Vite build)
- **Backend**: Apps Script Web App
- **API**: CORS-enabled Apps Script endpoints
- **Mobile**: Responsive design

## Next Steps
1. Set up React + Vite project structure
2. Create Google Sheets structure
3. Generate seed data
4. Implement Apps Script backend
5. Build React frontend components
6. Configure GitHub Pages deployment