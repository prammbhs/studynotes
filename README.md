# StudyNotes - AI-Powered Study Material Generator

A full-stack application that genreate and  organize, AI-generated notes and study guides. Upload documents, extract key topics with AI, and generate comprehensive study notes.

## 🚀 Features

### Core Features
- 🔐 **User Authentication** - Secure registration and login with JWT tokens
- 📤 **Document Management** - Upload and manage study materials (PDF, DOCX, Images, TXT)
- ✨ **AI Topic Extraction** - Automatically extract subtopics using Google Gemini AI
- 📝 **Note Generation** - Generate comprehensive notes for each extracted subtopic
- 💾 **Cloud Storage** - Secure storage using Google Cloud Storage
- 📊 **Comparison Tools** - Compare pattern-based and AI-powered extraction methods
- 👤 **Profile Management** - Update profile and manage account settings

### Technical Highlights
- Full-stack JavaScript/Node.js application
- RESTful API with Express.js
- Modern React frontend with Vite
- Firebase Authentication and Realtime Database
- Google Gemini AI integration
- Google Cloud Storage integration
- Responsive design for all devices

## 📁 Project Structure

```
studynotes-git-project/
├── backend/                 # Node.js Express API
│   ├── config/             # Configuration files
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   ├── server.js          # Main server file
│   └── package.json
│
├── frontend/               # React Vite application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API integration
│   │   ├── context/      # React context
│   │   ├── styles/       # Global styles
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── document/              # Documentation
    ├── ARCHITECTURE_DIAGRAMS.md
    ├── DOCUMENTATION_INDEX.md
    └── ...
```

## 🛠 Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Firebase** - Authentication and Realtime Database
- **Google Gemini AI** - AI text extraction and processing
- **Google Cloud Storage** - File storage
- **Multer** - File upload handling

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **React Router v7** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Responsive styling

### Services
- **Firebase Authentication** - Secure user management
- **Firebase Realtime Database** - Data persistence
- **Google Gemini API** - AI-powered text extraction
- **Google Cloud Storage** - Document storage

## 📋 API Endpoints

### Authentication (/api/auth)
| Method | Path | Description |
|--------|------|-------------|
| POST | /register | Register new user |
| POST | /login | User login |
| GET | /user | Get current user profile |
| GET | /users/:userId | Get user public profile |
| PUT | /profile | Update profile |
| DELETE | /profile | Delete account |

### Documents (/api/documents)
| Method | Path | Description |
|--------|------|-------------|
| POST | /upload | Upload document |
| GET | / | Get user documents |
| GET | /:documentId | Get document details |
| GET | /:documentId/text | Get document text |
| GET | /:documentId/download-url | Get download URL |
| DELETE | /:documentId | Delete document |

### Subtopics (/api/documents/:documentId/subtopics)
| Method | Path | Description |
|--------|------|-------------|
| POST | /gemini-extract | Extract with Gemini AI |
| GET | /compare | Compare extraction methods |

### Notes (/api)
| Method | Path | Description |
|--------|------|-------------|
| POST | /subtopics/:subtopicId/generate-notes | Generate notes |
| POST | /documents/:documentId/generate-all-notes | Generate all notes |
| GET | /subtopics/:subtopicId/notes | Get subtopic notes |
| GET | /documents/:documentId/all-notes | Get document notes |

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Firebase project setup
- Google Cloud project with Gemini API enabled
- Google Cloud Storage bucket

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with:
FIREBASE_API_KEY=your_key
FIREBASE_AUTH_DOMAIN=your_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
GEMINI_API_KEY=your_gemini_key
GCS_BUCKET_NAME=your_gcs_bucket
PORT=3000

# Start server
npm start
```

Server will run at `http://localhost:3000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file with:
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=StudyNotes

# Start development server
npm run dev
```

Application will be available at `http://localhost:5173`

## 📚 Backend Documentation

See [Backend API Documentation](backend/README.md) for detailed information about:
- Controllers
- Models
- Services
- Middleware
- Configuration

## 🎨 Frontend Documentation

See [Frontend Documentation](frontend/FRONTEND_README.md) for detailed information about:
- React components
- Pages and routing
- API integration
- State management
- Styling

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Firebase Configuration
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# API Configuration
GEMINI_API_KEY=your_gemini_api_key
GCS_BUCKET_NAME=your_gcs_bucket_name

# Server Configuration
PORT=3000
NODE_ENV=development
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=StudyNotes
```

## 🔐 Security Features

- JWT-based authentication
- Firebase Authentication for user management
- Secure file upload handling
- API request authentication via tokens
- Encrypted data storage in Firebase
- Google Cloud Storage security

## 📖 Document Processing

The application supports:
- **PDF** - Extracts text using OCR and text extraction
- **DOCX** - Reads document structure
- **Images** - Performs OCR on images
- **Text Files** - Direct text processing

## 🤖 AI Features

### Gemini Integration
- Intelligent subtopic extraction from documents
- Semantic understanding of content
- Natural language processing for note generation
- Comparison of extraction methods

### Note Generation
- Comprehensive note creation for each subtopic
- Multiple note generation strategies
- Quality improvements through AI

## 🧪 Testing

Run tests for backend:
```bash
cd backend
npm test
```

Run tests for frontend:
```bash
cd frontend
npm test
```

## 📦 Building for Production

### Backend
```bash
cd backend
npm run build
```

### Frontend
```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/`

## 🚀 Deployment

### Backend Deployment
Can be deployed to:
- Heroku
- Google Cloud Run
- AWS Lambda
- DigitalOcean
- Vercel

### Frontend Deployment
Can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 📝 Database Schema

### Users
- id (Firebase UID)
- name
- email
- createdAt
- updatedAt

### Documents
- id (auto-generated)
- userId (reference to user)
- name
- type (file type)
- fileUrl (GCS URL)
- createdAt
- updatedAt

### Subtopics
- id (auto-generated)
- documentId (reference to document)
- title
- extractionMethod (gemini/pattern)
- createdAt

### SavedResults
- id (auto-generated)
- subtopicId (reference to subtopic)
- notes (generated content)
- createdAt
- updatedAt


## Git Commands Used

Below are the major Git commands used throughout the project:

- `git init` – Initialize a local Git repository  
- `git status` – Check file status  
- `git add` – Stage files for commit  
- `git commit -m "message"` – Commit changes with meaningful messages  
- `git branch` – Create and list branches  
- `git checkout` – Switch between branches  
- `git merge` – Merge branches  
- `git rm --cached` – Remove files from tracking without deleting locally  
- `git remote add origin` – Connect local repo to GitHub  
- `git push` – Push commits to GitHub  
- `git pull` – Fetch and merge changes from GitHub  
- `git clone` – Clone remote repository  



## Branching Strategy

The following branches were created and used:

- **main**  
  Final stable branch containing merged code

- **feature/backend**  
  Used for backend development (Express server and APIs)

- **feature/frontend**  
  Used for frontend development (React UI)

- **bugfix/readme-fix**  
  Used to fix documentation issues

- **experiment/ui-test**  
  Used to experiment with UI layout changes

This branching strategy helps in organizing work and avoiding conflicts during development.



## Merge Conflict Demonstration

A merge conflict was intentionally created to demonstrate conflict handling.

### How the conflict occurred:
- The same section in `README.md` was modified differently in `main` and `feature/frontend` branches.
- When merging `feature/frontend` into `main`, Git detected conflicting changes.

### Resolution:
- The conflict markers were manually resolved.
- The correct content was selected and committed.

This demonstrates proper understanding of **merge conflicts and their resolution**.


## Screenshots

Screenshots included in the `screenshots/` folder:

- Git branch list
- Commit history graph
- Merge conflict screen
- Conflict resolution
- GitHub repository view

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🙋 Support

For issues, questions, or suggestions:
1. Check existing documentation
2. Review API endpoints
3. Open an issue on GitHub
4. Contact the development team


## 📅 Project Status

- ✅ Backend API - Complete
- ✅ Frontend Application - Complete
- ✅ Authentication System - Complete
- ✅ Document Upload & Processing - Complete
- ✅ AI Integration (Gemini) - Complete
- 🔄 Note Generation - In Progress
- 🔄 Testing & Optimization - In Progress
- 🔄 Deployment & Production - Next Phase

## 🎯 Future Enhancements

- [ ] Mobile application (React Native)
- [ ] Advanced note formatting
- [ ] Collaborative study features
- [ ] Export to multiple formats (PDF, Word, etc.)
- [ ] Study schedule recommendations
- [ ] Performance analytics
- [ ] Multi-language support
- [ ] Voice note generation

---

**Created with ❤️ for students who want to learn smarter**
