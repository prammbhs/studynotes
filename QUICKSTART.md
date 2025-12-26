# Quick Start Guide - StudyNotes

Get your StudyNotes application up and running in minutes!

## 📋 Prerequisites

- Node.js v16 or higher
- npm or yarn package manager
- A Firebase account
- A Google Cloud project with Gemini API enabled

## 🚀 Quick Start (5 minutes)

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment variables template
copy .env.example .env

# Edit .env with your Firebase and Gemini credentials
# Required variables:
# - FIREBASE_API_KEY
# - FIREBASE_AUTH_DOMAIN
# - FIREBASE_PROJECT_ID
# - FIREBASE_STORAGE_BUCKET
# - GEMINI_API_KEY
# - GCS_BUCKET_NAME
# - PORT (default: 3000)

# Start the backend server
npm start
```

✅ Backend will run on `http://localhost:3000`

### Step 2: Frontend Setup

```bash
# Open new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Frontend dependencies should already include:
# - react
# - react-dom
# - react-router-dom
# - axios

# Check .env file (should have:)
# VITE_API_BASE_URL=http://localhost:3000
# VITE_APP_NAME=StudyNotes

# Start development server
npm run dev
```

✅ Frontend will run on `http://localhost:5173`

### Step 3: Test the Application

1. Open `http://localhost:5173` in your browser
2. You should see the StudyNotes home page
3. Click "Get Started Free" to create an account
4. Register with email and password
5. Upload a study document (PDF, DOCX, or Image)
6. Extract subtopics using Gemini AI
7. Generate comprehensive notes

## 🗂️ Project Structure Overview

```
studynotes-git-project/
├── backend/              # Express.js API server
│   ├── controllers/      # API endpoint handlers
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── config/          # Configuration
│   └── server.js        # Entry point
│
├── frontend/            # React application
│   ├── src/
│   │   ├── pages/      # Page components (Home, Dashboard, etc.)
│   │   ├── components/ # Reusable components
│   │   ├── services/   # API client
│   │   ├── context/    # Auth context
│   │   └── styles/     # Styling
│   ├── index.html      # HTML entry point
│   └── vite.config.js  # Vite configuration
│
└── document/           # Documentation files
```

## 🔑 Key Features

### 1. Authentication
- Create account: Register page
- Login: Use email and password
- Logout: Click logout button in header
- Protected routes: Automatically redirect to login if not authenticated

### 2. Document Management
- Upload documents (PDF, DOCX, Images, TXT)
- View all your documents
- Download original files
- Delete documents

### 3. AI Features
- Extract subtopics using Gemini AI
- Compare extraction methods (pattern-based vs AI)
- Generate comprehensive notes for each subtopic

### 4. Profile
- View and update profile information
- Change name (email is read-only)
- Delete account

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register      - Create new account
POST   /api/auth/login         - Login user
GET    /api/auth/user          - Get current user
PUT    /api/auth/profile       - Update profile
DELETE /api/auth/profile       - Delete account
```

### Documents
```
POST   /api/documents/upload   - Upload document
GET    /api/documents/         - Get user documents
GET    /api/documents/:id      - Get document details
DELETE /api/documents/:id      - Delete document
GET    /api/documents/:id/download-url - Get download URL
```

### AI Features
```
POST   /api/documents/:id/subtopics/gemini-extract - Extract with AI
GET    /api/documents/:id/subtopics/compare        - Compare methods
```

### Notes
```
POST   /api/subtopics/:id/generate-notes           - Generate notes
POST   /api/documents/:id/generate-all-notes       - Generate all notes
GET    /api/subtopics/:id/notes                    - Get notes
GET    /api/documents/:id/all-notes                - Get all notes
```

## 📝 File Upload Guide

### Supported Formats
- **Documents**: PDF, DOCX, TXT
- **Images**: PNG, JPG, JPEG
- **Max Size**: 10MB (configurable)

### Upload Steps
1. Go to Dashboard
2. Click "Upload Document"
3. Select a file or drag & drop
4. Wait for upload to complete
5. Click "Extract Subtopics" to process

## 🛠️ Troubleshooting

### Issue: Backend connection error
**Solution**: 
- Check backend is running on port 3000
- Verify .env variables are set correctly
- Check CORS settings in backend

### Issue: Gemini AI not working
**Solution**:
- Verify GEMINI_API_KEY in .env
- Check API is enabled in Google Cloud Console
- Ensure API quota is available

### Issue: File upload fails
**Solution**:
- Check file is in supported format
- Verify file size < 10MB
- Check Google Cloud Storage bucket is accessible
- Verify GCS_BUCKET_NAME in .env

### Issue: Frontend shows blank page
**Solution**:
- Clear browser cache
- Check browser console for errors
- Verify Node.js version (16+)
- Try `npm install` again

### Issue: Cannot login
**Solution**:
- Ensure backend is running
- Check Firebase credentials in .env
- Verify email/password are correct
- Check Firebase Database rules allow reads/writes

## 📦 Install Additional Dependencies (if needed)

Frontend dependencies:
```bash
cd frontend
npm install axios react-router-dom
```

Backend dependencies:
```bash
cd backend
npm install express multer firebase-admin dotenv cors
```

## 🎯 Development Workflow

### Making Changes

**Frontend**:
```bash
cd frontend
npm run dev
# Make changes - they auto-reload
# Ctrl+C to stop
```

**Backend**:
```bash
cd backend
npm start
# Make changes
# Server needs manual restart
```

### Building for Production

**Frontend**:
```bash
cd frontend
npm run build
# Output in dist/ folder
```

**Backend**:
```bash
cd backend
npm run build
# Or just deploy server.js and dependencies
```

## 🚀 Deployment Quick Links

### Frontend (Vercel)
```bash
cd frontend
npm install -g vercel
vercel
```

### Backend (Heroku)
```bash
heroku login
heroku create your-app-name
git push heroku main
```

## 📚 Documentation

- **Backend Details**: See `backend/` directory
- **Frontend Details**: See `frontend/FRONTEND_README.md`
- **Full Documentation**: See `document/DOCUMENTATION_INDEX.md`
- **Architecture**: See `document/ARCHITECTURE_DIAGRAMS.md`

## 🆘 Getting Help

1. **Check Logs**: 
   - Frontend: Browser Developer Tools (F12)
   - Backend: Terminal console

2. **Verify Configuration**:
   - `.env` files are correctly set
   - Firebase project is properly configured
   - Google Cloud APIs are enabled

3. **Common Issues**:
   - Port already in use: Change PORT in .env
   - Permission denied: Check file permissions
   - API errors: Verify API keys and quotas

## ✅ Verification Checklist

- [ ] Backend running on localhost:3000
- [ ] Frontend running on localhost:5173
- [ ] Can access home page
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Can upload a document
- [ ] Can extract subtopics
- [ ] Can generate notes
- [ ] Can download documents
- [ ] Can update profile

## 🎉 You're Ready!

Your StudyNotes application is now running! Start by:

1. Creating an account
2. Uploading a sample document
3. Extracting subtopics with AI
4. Generating comprehensive notes
5. Downloading your study materials

For detailed information, refer to the full README.md and documentation in the `document/` folder.

---

**Happy studying! 📚✨**
