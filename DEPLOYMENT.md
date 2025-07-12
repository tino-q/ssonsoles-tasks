# Deployment Guide

## Prerequisites

1. **Google Account** with Apps Script API enabled
2. **GitHub Repository** for your project
3. **Node.js** installed locally

## Initial Setup

### 1. Install clasp globally
```bash
npm install -g @google/clasp
```

### 2. Enable Apps Script API
- Go to https://script.google.com/home/usersettings
- Turn on "Google Apps Script API"

### 3. Login to clasp
```bash
clasp login
```
This opens a browser window for Google authentication.

### 4. Create Apps Script Project
```bash
# Option A: Create new project
clasp create --type webapp --title "Cleaning Management System"

# Option B: Clone existing project (if you already have one)
clasp clone <YOUR_SCRIPT_ID>
```

### 5. Update Configuration Files

1. **Update `.clasp.json`** with your script ID:
```json
{
  "scriptId": "YOUR_ACTUAL_SCRIPT_ID",
  "rootDir": "./apps-script"
}
```

2. **Update `apps-script/Code.gs`** with your Google Sheet ID:
```javascript
const SHEET_ID = 'YOUR_ACTUAL_GOOGLE_SHEET_ID';
```

### 6. Deploy Apps Script
```bash
# Push code to Apps Script
clasp push --force

# Deploy as web app
clasp deploy --description "Initial deployment"
```

## GitHub Actions Auto-Deployment

### 1. Get clasp credentials
After running `clasp login`, get credentials from:
- **Windows:** `%APPDATA%\.clasprc.json`
- **Mac/Linux:** `~/.clasprc.json`

### 2. Add GitHub Secrets
In your GitHub repository, go to Settings → Secrets and Variables → Actions:

#### Add these secrets:

**CLASP_CREDENTIALS** (entire content of `.clasprc.json`):
```json
{
  "token": {
    "access_token": "ya29...",
    "refresh_token": "1//...",
    "scope": "https://www.googleapis.com/auth/script.projects",
    "token_type": "Bearer"
  },
  "oauth2ClientSettings": {
    "clientId": "...",
    "clientSecret": "...",
    "redirectUri": "..."
  },
  "isLocalCreds": false
}
```

**APPS_SCRIPT_ID** (your Apps Script project ID):
```
1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

**APPS_SCRIPT_DEPLOYMENT_URL** (your web app URL):
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

### 3. Enable GitHub Pages
1. Go to repository Settings → Pages
2. Set Source to "GitHub Actions"
3. The workflow will automatically deploy to `https://yourusername.github.io/repository-name/`

## Manual Deployment Commands

### Apps Script:
```bash
# Push code changes
clasp push --force

# Create new deployment
clasp deploy --description "Manual deployment $(date)"

# List deployments
clasp deployments
```

### Frontend:
```bash
# Build for production
cd frontend && npm run build

# The dist/ folder can be deployed to any static hosting
```

## Testing Deployment

### 1. Test Apps Script
- Go to your Apps Script deployment URL
- Add `?action=getCleaners` to test the API
- Should return JSON response with cleaners data

### 2. Test Frontend
- Access your GitHub Pages URL
- Try logging in with a cleaner's phone number
- Verify all features work end-to-end

## Troubleshooting

### Common Issues:

1. **"Script not found" error:**
   - Check APPS_SCRIPT_ID in GitHub secrets
   - Verify .clasp.json has correct scriptId

2. **"Unauthorized" error:**
   - Re-run `clasp login` locally
   - Update CLASP_CREDENTIALS secret with new token

3. **CORS errors:**
   - Apps Script deployment must be set to "Anyone" access
   - Check webapp.access in appsscript.json

4. **API not responding:**
   - Verify SHEET_ID in Code.gs
   - Check Google Sheet permissions
   - Run testSetup() function in Apps Script editor

### Useful Commands:
```bash
# Check clasp status
clasp status

# Open Apps Script editor
clasp open

# View deployment info
clasp deployments

# Test locally (frontend only)
cd frontend && npm run dev
```