# StudyNotes Project - Complete Overview

## Project Vision

StudyNotes is an intelligent study companion that helps students:
1. **Upload syllabi** (PDFs, images, or text files)
2. **Automatically identify subtopics** from the uploaded materials
3. **Generate comprehensive study notes** using Google Gemini AI
4. **Save and manage** their study resources in one place

## Architecture Overview

```
┌─────────────────┐
│   Frontend      │  React 19 + Vite + Tailwind CSS
│  (React SPA)    │  - Authentication pages
└────────┬────────┘  - Document dashboard
         │           - File upload interface
         │           - Subtopic viewer
         │           - Profile management
         │
    HTTP/REST API (Axios)
         │
┌────────▼──────────────────────────────────────┐
│   Backend (Node.js + Express)                  │
├──────────────────────────────────────────────┤
│  Routes & Controllers:                        │
│  • /api/auth/*       - Firebase auth          │
│  • /api/documents/*  - Document management    │
│  • /api/subtopics/*  - Subtopic handling      │
│                                               │
│  Middleware:                                  │
│  • Authentication verification                │
│  • File upload handling (multer)              │
│  • Error handling                             │
│  • Validation                                 │
│                                               │
│  Services:                                    │
│  • Firebase Authentication                    │
│  • Google Cloud Storage (GCS)                 │
│  • Text extraction (PDF, OCR, etc.)           │
│  • Subtopic identification                    │
│  • Gemini API integration                     │
└────────┬───────────────────────────────────┬─┘
         │                                   │
    ┌────▼───┐                       ┌──────▼────┐
    │MongoDB │ User, Document,       │   GCS     │
    │        │ Subtopic, SavedResult │ Buckets   │
    └────────┘                       └───────────┘
                                          │
    ┌────────────────────────────────────▼──┐
    │  External APIs                        │
    │  • Firebase Auth                      │
    │  • Google Gemini API                  │
    └──────────────────────────────────────┘
```

## Implemented Features (Steps 1-5)

### ✅ Step 1: Server Setup & Dependencies
**Status**: Backend configured

- Express.js server initialized with all required packages
- CORS, Helmet, Morgan middleware configured
- Environment variables management with dotenv
- Database connection ready (MongoDB)
- GCS and Firebase SDK initialized
- Port: 5000 (configurable)

**Key Files**:
- [backend/server.js](../backend/server.js) - Main server entry point
- [backend/package.json](../backend/package.json) - All dependencies listed
- [backend/config/firebase.js](../backend/config/firebase.js) - Firebase initialization
- [backend/config/gcs.js](../backend/config/gcs.js) - Google Cloud Storage setup
- [backend/config/database.js](../backend/config/database.js) - MongoDB connection

---

### ✅ Step 2: MongoDB Schemas & Models
**Status**: Data models defined

**Models Created**:

1. **User** ([backend/models/User.js](../backend/models/User.js))
   - Firebase UID, email, name, bio
   - Timestamps for created/updated

2. **Document** ([backend/models/Document.js](../backend/models/Document.js))
   - Title, file info, GCS path
   - Status tracking (processing/completed/failed)
   - Original extracted text

3. **Subtopic** ([backend/models/Subtopic.js](../backend/models/Subtopic.js))
   - Title, description, order
   - Page numbers, extracted text
   - References to parent document

4. **SavedResult** ([backend/models/SavedResult.js](../backend/models/SavedResult.js))
   - User's saved study notes
   - Gemini API responses
   - Tagging and favorite features

---

### ✅ Step 3: Authentication System (Firebase)
**Status**: Authentication fully implemented

**Frontend**:
- [Login page](src/pages/Login.jsx) - Email/password login
- [Register page](src/pages/Register.jsx) - New user registration
- [Profile page](src/pages/Profile.jsx) - User profile management
- [AuthContext](src/context/AuthContext.jsx) - Global auth state
- [ProtectedRoute](src/components/ProtectedRoute.jsx) - Route protection

**Backend**:
- [authController](../backend/controllers/authController.js) - Auth logic
- [authRoutes](../backend/routes/authRoutes.js) - Auth endpoints
- [auth middleware](../backend/middleware/auth.js) - Token verification
- Firebase Admin SDK integration

**Features**:
- ✅ User registration with validation
- ✅ Email/password login
- ✅ Firebase token generation and storage
- ✅ Token refresh on API calls (interceptor)
- ✅ Auto-logout on token expiration (401)
- ✅ Profile viewing and updating
- ✅ Account deletion with confirmation

---

### ✅ Step 4: File Upload & Processing
**Status**: Upload pipeline ready

**Frontend**:
- [FileUpload component](src/components/FileUpload.jsx)
  - Drag-and-drop interface
  - File type validation (PDF, JPG, PNG, WebP, TXT)
  - File size validation (max 10MB)
  - Upload progress tracking
  - Visual feedback (success/error)

**Backend**:
- [uploadMiddleware](../backend/middleware/uploadMiddleware.js) - Multer configuration
- [fileProcessor utility](../backend/utils/fileProcessor.js) - Text extraction
  - PDF parsing with pdf-parse
  - OCR with Tesseract.js
  - Text file reading
  - Text normalization
- [documentController](../backend/controllers/documentController.js) - Upload logic
- [documentRoutes](../backend/routes/documentRoutes.js) - Upload endpoints

**Features**:
- ✅ Drag-and-drop file upload
- ✅ File validation (type, size)
- ✅ Upload to Google Cloud Storage
- ✅ Automatic text extraction
- ✅ Document status tracking
- ✅ Error handling and retry logic

---

### ✅ Step 5: Subtopic Identification
**Status**: Subtopic detection and display working

**Frontend**:
- [DocumentDetail page](src/pages/DocumentDetail.jsx)
  - Display document info
  - List all identified subtopics
  - Show document status
- [SubtopicCard component](src/components/SubtopicCard.jsx)
  - Subtopic title and description
  - Page numbers
  - Generate notes button
  - Display generated notes

**Backend**:
- [subtopicService](../backend/services/subtopicService.js) - Subtopic detection
- [subtopicController](../backend/controllers/subtopicController.js) - Subtopic logic
- [subtopicRoutes](../backend/routes/subtopicRoutes.js) - Subtopic endpoints
- [Subtopic model](../backend/models/Subtopic.js) - Data schema

**Features**:
- ✅ Automatic subtopic detection from extracted text
- ✅ Pattern-based identification (headings, sections)
- ✅ Subtopic ordering and page tracking
- ✅ Display all subtopics for a document
- ✅ Subtopic management (view, update)

---

## Frontend File Structure

```
frontend/src/
├── api/
│   ├── client.js          # Axios instance with interceptors
│   ├── auth.js            # Auth API endpoints
│   ├── documents.js       # Document API endpoints
│   └── subtopics.js       # Subtopic API endpoints
│
├── context/
│   └── AuthContext.jsx    # Global authentication state
│
├── components/
│   ├── FileUpload.jsx     # File upload with drag & drop
│   ├── SubtopicCard.jsx   # Subtopic display & notes
│   ├── Navigation.jsx     # Top navigation bar
│   └── ProtectedRoute.jsx # Auth-protected routes
│
├── pages/
│   ├── Login.jsx          # Login page
│   ├── Register.jsx       # Registration page
│   ├── Profile.jsx        # User profile
│   ├── Dashboard.jsx      # Document list
│   └── DocumentDetail.jsx # Document details & subtopics
│
├── App.jsx                # Main app with routing
├── main.jsx               # React entry point
└── index.css              # Tailwind CSS
```

---

## Running the Application

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file with required variables
cp .env.example .env
# Edit .env with your GCP, Firebase, MongoDB credentials

# Start development server
npm run dev

# Server runs on http://localhost:5000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
# Edit .env.local with API URL and Firebase config

# Start development server
npm run dev

# App runs on http://localhost:5173
```

---

## API Communication Flow

### 1. User Registration
```
Frontend: Register form → POST /api/auth/register
Backend: Create Firebase user + MongoDB record → Return token
Frontend: Store token + user data → Redirect to dashboard
```

### 2. File Upload
```
Frontend: Drag file → POST /api/documents/upload (multipart)
Backend: 
  - Save to GCS
  - Extract text
  - Create Document record
  - Detect subtopics
  → Return document data
Frontend: Update document list → Show subtopics
```

### 3. Generate Notes
```
Frontend: Click "Generate Notes" → POST /api/subtopics/:id/generate-notes
Backend:
  - Get subtopic text
  - Call Gemini API
  - Save response
  → Return generated notes
Frontend: Display notes in SubtopicCard
```

---

## State Management

### AuthContext
Manages:
- `user` - Current logged-in user
- `isAuthenticated` - Boolean flag
- `loading` - Loading state
- `error` - Auth error messages

Methods:
- `register()` - Create new account
- `login()` - Login user
- `logout()` - Clear auth state
- `updateProfile()` - Update user info
- `deleteAccount()` - Delete user

---

## Key Technologies

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 19 | UI library |
| React Router 7 | Client-side routing |
| Vite | Build tool & dev server |
| Tailwind CSS 4 | Styling |
| Axios | HTTP client |
| React Context | State management |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | Server framework |
| MongoDB + Mongoose | Database |
| Firebase Admin SDK | Authentication |
| Google Cloud Storage SDK | File storage |
| Google Gemini API | AI note generation |
| pdf-parse | PDF text extraction |
| Tesseract.js | OCR for images |
| Multer | File upload handling |
| Joi | Input validation |

---

## Environment Variables

### Frontend (.env.local)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://...

# Firebase
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...

# Google Cloud
GCP_PROJECT_ID=...
GCS_BUCKET_NAME=...

# APIs
GEMINI_API_KEY=...
```

---

## Next Steps (Steps 6-8)

### Step 6: Complete REST API Routes
- [ ] All remaining endpoints implemented
- [ ] Consistent response format
- [ ] Comprehensive error handling
- [ ] Request validation

### Step 7: Error Handling & Validation
- [ ] Global error handler middleware
- [ ] Input validation schemas (Joi)
- [ ] Logging system (Winston)
- [ ] Custom error classes

### Step 8: Testing & Deployment
- [ ] Unit tests (Jest)
- [ ] Integration tests (Supertest)
- [ ] E2E testing
- [ ] Production build optimization

---

## Features by Step

| Feature | Frontend | Backend | Status |
|---------|----------|---------|--------|
| **Step 1: Server Setup** | - | ✅ | Ready |
| **Step 2: Data Models** | - | ✅ | Ready |
| **Step 3: Authentication** | ✅ | ✅ | Ready |
| **Step 4: File Upload** | ✅ | ✅ | Ready |
| **Step 5: Subtopics** | ✅ | ✅ | Ready |
| **Step 6: Routes & Controllers** | ✅ | ✅ | Partial |
| **Step 7: Error Handling** | ✅ | ✅ | Partial |
| **Step 8: Testing & Deploy** | - | - | Pending |

---

## Common Issues & Solutions

### CORS Errors
- Ensure backend CORS is configured correctly
- Check that frontend URL is whitelisted in backend

### File Upload Fails
- Verify file size < 10MB
- Check supported file types
- Ensure GCS bucket exists and credentials are valid

### API Requests Return 401
- Check if token is stored in localStorage
- Verify token hasn't expired
- Check auth middleware in backend

### Subtopics Not Appearing
- Verify document status is 'completed'
- Check if text extraction succeeded
- Check backend subtopic detection logic

---

## Development Workflow

1. **Create feature branch**: `git checkout -b feature/feature-name`
2. **Implement changes**: Add files/modify code
3. **Test locally**: `npm run dev`
4. **Commit changes**: `git commit -m "Description"`
5. **Push to remote**: `git push origin feature/feature-name`
6. **Create pull request**: Describe changes and tests
7. **Merge to main**: After review

---

## Documentation Files

- [Frontend README_SETUP.md](./README_SETUP.md) - Frontend detailed setup
- [Backend README.md](../backend/README.md) - Backend setup and architecture
- [Implementation Plan](../plan-studyNotes.prompt.md) - Complete project plan

---

**Last Updated**: December 26, 2025
**Project Status**: MVP Frontend for Steps 1-5 Complete ✅
