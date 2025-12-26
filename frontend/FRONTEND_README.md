# StudyNotes Frontend

A modern React application for uploading study materials, extracting key topics with AI, and generating comprehensive study notes.

## Features

- 🔐 **User Authentication** - Secure registration and login
- 📤 **Document Upload** - Upload PDFs, DOCX, images, and text files
- ✨ **AI Topic Extraction** - Automatically extract subtopics using Gemini AI
- 📝 **Note Generation** - Generate comprehensive notes for each subtopic
- 💾 **Document Management** - View, download, and delete your documents
- 👤 **Profile Management** - Update profile information and manage account
- 🎨 **Modern UI** - Clean, responsive, and user-friendly interface

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router v7** - Client-side routing
- **Axios** - HTTP client with interceptors
- **CSS3** - Responsive styling
- **Daisy-UI** - UI library
## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Header.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── LoadingSpinner.jsx
│   ├── pages/              # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   └── Profile.jsx
│   ├── services/           # API service layer
│   │   └── api.js
│   ├── context/            # React context
│   │   └── AuthContext.jsx
│   ├── styles/             # Global styles
│   │   └── global.css
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── vite.config.js
├── package.json
└── index.html
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start dev server
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=StudyNotes
```

## API Integration

The frontend integrates with the backend API at `http://localhost:3000`. The API service (`src/services/api.js`) includes:

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/user` - Get current user
- `PUT /api/auth/profile` - Update profile
- `DELETE /api/auth/profile` - Delete account

### Document Endpoints
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/` - Get user documents
- `GET /api/documents/:documentId` - Get document details
- `DELETE /api/documents/:documentId` - Delete document
- `GET /api/documents/:documentId/download-url` - Get download URL

### Subtopic Endpoints
- `POST /api/documents/:documentId/subtopics/gemini-extract` - Extract with Gemini AI
- `GET /api/documents/:documentId/subtopics/compare` - Compare extraction methods

### Notes Endpoints
- `POST /api/subtopics/:subtopicId/generate-notes` - Generate notes for subtopic
- `POST /api/documents/:documentId/generate-all-notes` - Generate all notes
- `GET /api/subtopics/:subtopicId/notes` - Get subtopic notes
- `GET /api/documents/:documentId/all-notes` - Get all document notes

## Authentication Flow

1. Users register or login
2. Auth token is stored in localStorage
3. Token is automatically added to API requests via interceptor
4. Protected routes require authentication
5. On 401 error, user is redirected to login

## File Upload

Supported file types:
- Documents: PDF (.pdf), Word (.docx), Text (.txt)
- Images: PNG (.png), JPG (.jpg), JPEG (.jpeg)

## Building for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

## Preview Production Build

```bash
npm run preview
```

## Development

### Running with Hot Module Replacement (HMR)

```bash
npm run dev
```

Changes to source files will automatically refresh the browser.

### Code Structure

- **Components**: Reusable UI elements with their own CSS modules
- **Pages**: Full page components that use multiple components
- **Services**: API calls abstracted into service functions
- **Context**: Global state management for authentication
- **Styles**: Global CSS and component-specific styles

## Features Details

### Authentication
- Secure login and registration
- JWT token-based authentication
- Protected routes for authenticated users
- Automatic redirect on auth errors

### Document Management
- Upload multiple documents
- View all uploaded documents
- Download original documents
- Delete documents

### AI-Powered Features
- Extract subtopics using Gemini AI
- Compare extraction methods (pattern-based vs AI)
- Generate comprehensive notes for subtopics
- Bulk note generation for all subtopics in a document

### User Profile
- View and update profile information
- Account deletion with confirmation

## Error Handling

- Global error alerts for API failures
- Form validation on client side
- User-friendly error messages
- Automatic logout on 401 unauthorized

## Responsive Design

The application is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile devices

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions, please contact the development team or open an issue on GitHub.
