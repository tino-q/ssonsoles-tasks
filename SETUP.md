# Setup Instructions

## 1. Google Sheets Setup

### Create a new Google Sheets document with the following sheets:

#### Sheet 1: "reservations"
| A | B | C | D |
|---|---|---|---|
| property | checkin_date | checkout_date | notes |

#### Sheet 2: "tasks"
| A | B | C | D | E | F | G | H | I | J | K | L |
|---|---|---|---|---|---|---|---|---|---|---|---|
| id | property | type | date | status | cleaner | notes | start_time | end_time | comments | start_video | end_video |

#### Sheet 3: "cleaners"
| A | B | C | D | E |
|---|---|---|---|---|
| id | name | phone | hourly_rate | active |

#### Sheet 4: "products"
| A | B | C | D |
|---|---|---|---|
| id | name | category | min_stock |

#### Sheet 5: "product_requests"
| A | B | C | D | E |
|---|---|---|---|---|
| id | task_id | product_id | quantity | request_date |

### Populate with seed data from the CSV files in `seed-data/` folder

## 2. Apps Script Setup

1. Open Google Apps Script (script.google.com)
2. Create a new project
3. Copy all the `.gs` files from `apps-script/` folder
4. Copy the `appsscript.json` configuration
5. **Important**: Update the `SHEET_ID` in `Code.gs` with your Google Sheet ID
6. Save and deploy as web app:
   - Execute as: "Me"
   - Who has access: "Anyone"
   - Copy the deployment URL

## 3. Frontend Setup

1. Update the API URL in `frontend/src/services/api.js`:
   ```javascript
   const API_BASE_URL = 'YOUR_APPS_SCRIPT_DEPLOYMENT_URL';
   ```

2. Install dependencies and run:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 4. Testing

1. Run the `testSetup()` function in Apps Script to verify sheet access
2. Test the web app by accessing the deployment URL
3. Test the React app by logging in with a cleaner's phone number

## 5. Deployment

### Frontend (GitHub Pages):
1. Build the project: `npm run build`
2. Deploy the `dist/` folder to GitHub Pages
3. Update the base URL in `vite.config.js` if needed

### Backend:
- Apps Script is already deployed as web app
- No additional deployment needed

## 6. Usage

### For Madi (Admin):
- Use Google Sheets directly to:
  - Add/edit reservations in "reservations" sheet
  - Assign cleaners to tasks in "tasks" sheet
  - Manage cleaner information in "cleaners" sheet
  - Monitor product requests in "product_requests" sheet

### For Cleaners:
- Access the React web app
- Log in with phone number
- Confirm/reject assigned tasks
- Record cleaning execution with videos and comments
- Request products during cleaning

## 7. WhatsApp Integration

When assigning tasks in Google Sheets, use this WhatsApp message format:
```
Hola [CLEANER_NAME], te comparto una limpieza asignada:
FECHA: [DATE]
PROPIEDAD: [PROPERTY]
NOTAS: [NOTES]
```

Generate link: `https://wa.me/[PHONE]?text=[ENCODED_MESSAGE]`