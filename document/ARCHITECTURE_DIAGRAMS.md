# Frontend Architecture & Data Flow Diagrams

## 1. Overall System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     React Frontend (Port 5173)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    React Router (App.jsx)                   │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │                                                             │ │
│  │  Public Routes:                Protected Routes:           │ │
│  │  ├─ /login        → Login.jsx   ├─ /dashboard →  Dashboard │ │
│  │  ├─ /register     → Register.jsx ├─ /profile   → Profile   │ │
│  │  └─ /            → Navigate     └─ /document/* → DocDetail │ │
│  │                                                             │ │
│  │              (All protected by ProtectedRoute)              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    AuthProvider (Context)                  │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ State: user, isAuthenticated, loading, error               │ │
│  │ Methods: register, login, logout, updateProfile            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              API Clients & Interceptors                    │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ Axios Instance (client.js)                                 │ │
│  │ ├─ Request: Add Firebase token header                      │ │
│  │ ├─ Response: Handle 401 → redirect to login                │ │
│  │ └─ Base URL: http://localhost:5000/api                     │ │
│  │                                                             │ │
│  │ Modules:                                                   │ │
│  │ ├─ authAPI     (register, login, profile)                 │ │
│  │ ├─ documentsAPI (upload, list, details, delete)           │ │
│  │ └─ subtopicsAPI (generate notes, get notes)               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Component Hierarchy                       │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │                                                             │ │
│  │  Navigation                                                │ │
│  │  ├─ Dashboard                                              │ │
│  │  │  ├─ FileUpload                                          │ │
│  │  │  └─ Document List                                       │ │
│  │  ├─ DocumentDetail                                         │ │
│  │  │  └─ SubtopicCard(s)                                     │ │
│  │  ├─ Profile                                                │ │
│  │  ├─ Login                                                  │ │
│  │  └─ Register                                               │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
        ↓ (HTTP/REST API with JWT Token)
┌─────────────────────────────────────────────────────────────────┐
│                  Express Backend (Port 5000)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Routes → Controllers → Services → Database & External APIs      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Tree

```
App.jsx (BrowserRouter + AuthProvider)
│
├─ Public Routes:
│  ├─ /login → Login.jsx
│  │  └─ Uses: authAPI.login()
│  │
│  └─ /register → Register.jsx
│     └─ Uses: authAPI.register()
│
├─ Protected Routes (wrapped by ProtectedRoute + Navigation):
│  │
│  ├─ /dashboard → Dashboard.jsx
│  │  ├─ FileUpload (if showUpload)
│  │  │  └─ Calls: documentsAPI.uploadDocument()
│  │  │
│  │  └─ Document List
│  │     └─ Each item → Link to /document/:id
│  │
│  ├─ /document/:id → DocumentDetail.jsx
│  │  └─ SubtopicCard[] (one per subtopic)
│  │     ├─ Calls: subtopicsAPI.generateNotes()
│  │     └─ Displays generated notes
│  │
│  ├─ /profile → Profile.jsx
│  │  ├─ View user info
│  │  └─ Calls: authAPI.updateProfile() or authAPI.deleteAccount()
│  │
│  └─ Navigation (shown on all protected pages)
│     ├─ Logo / Dashboard link
│     ├─ Nav links (Dashboard, Profile)
│     └─ User menu with Logout
│
└─ Default redirect:
   └─ / → /dashboard
```

---

## 3. Authentication Flow

```
┌─────────────┐
│  User Start │
└──────┬──────┘
       │
       ├─────────────────────────┐
       │                         │
       ↓                         ↓
   ┌────────┐            ┌──────────┐
   │ Login  │            │ Register │
   └───┬────┘            └────┬─────┘
       │                      │
       └──────────┬───────────┘
                  │
        Enter Email & Password
                  │
                  ↓
    ┌─────────────────────────┐
    │  Validate Form Inputs   │
    │  - Email format         │
    │  - Password required    │
    └───────┬─────────────────┘
            │
            ↓
  ┌────────────────────────┐
  │ POST /api/auth/login   │
  │ or                     │
  │ POST /api/auth/register│
  └───────┬────────────────┘
          │
          ↓
┌──────────────────────────────────┐
│ Backend Returns:                 │
│ {                                │
│   success: true,                 │
│   data: {                        │
│     user: { id, email, ... },   │
│     token: "firebase-jwt-token" │
│   }                              │
│ }                                │
└───────┬────────────────────────┬─┘
        │                        │
        ↓                        ↓
  localStorage.setItem      AuthContext.setUser()
  ("firebaseToken", token)   
        │                        │
        └────────────┬───────────┘
                     │
                     ↓
          ┌────────────────────┐
          │ ProtectedRoute     │
          │ isAuthenticated=true
          └────────┬───────────┘
                   │
                   ↓
          ┌────────────────────┐
          │   Dashboard Page   │
          │   (User Logged In) │
          └────────────────────┘

---

On Logout:
┌──────────┐
│ Logout   │
│ Button   │
└────┬─────┘
     │
     ↓
AuthContext.logout()
├─ authAPI.logout()
│  (clears localStorage)
├─ setUser(null)
└─ Navigate to /login
```

---

## 4. File Upload Flow

```
Dashboard.jsx
    │
    ├─ [Upload Document Button]
    │
    └─ FileUpload.jsx
       │
       ├─ Drag-Drop Zone
       │  ├─ ondragenter/ondragover → highlight
       │  ├─ ondragleave → unhighlight
       │  └─ ondrop → handleDrop()
       │
       ├─ File Input
       │  └─ onchange → handleChange()
       │
       ├─ handleFiles()
       │  ├─ Check: File type in allowedTypes?
       │  ├─ Check: File size ≤ 10MB?
       │  └─ if valid → uploadFile()
       │
       ├─ uploadFile()
       │  ├─ Create FormData
       │  ├─ POST /api/documents/upload
       │  │  (documentsAPI.uploadDocument)
       │  │
       │  ├─ Simulate Progress (30ms intervals)
       │  │  └─ Update progress bar
       │  │
       │  ├─ Success:
       │  │  ├─ Show success message
       │  │  ├─ Call onUploadSuccess(document)
       │  │  └─ Reset form
       │  │
       │  └─ Error:
       │     └─ Show error message
       │
       └─ UI Updates:
          ├─ Progress bar (0-100%)
          ├─ Status messages
          └─ Error alerts
```

---

## 5. Subtopic & Notes Generation Flow

```
Dashboard.jsx
    │
    ├─ Document List
    │
    └─ [View Subtopics Button]
        │
        ↓
    DocumentDetail.jsx
        │
        ├─ GET /api/documents/:documentId
        ├─ GET /api/documents/:documentId/subtopics
        │
        ↓
    Display:
    ├─ Document Info
    │  ├─ Title
    │  ├─ File name
    │  ├─ Status
    │  └─ Upload date
    │
    └─ SubtopicCard[] (for each subtopic)
       │
       ├─ Display:
       │  ├─ Title
       │  ├─ Description
       │  ├─ Page numbers
       │  └─ Part number
       │
       ├─ [Generate Study Notes Button]
       │  │
       │  ├─ Loading state
       │  │
       │  └─ POST /api/subtopics/:subtopicId/generate-notes
       │     (subtopicsAPI.generateNotes)
       │     │
       │     ↓ Backend calls Gemini API
       │     │
       │     ├─ Success:
       │     │  └─ Return generated notes (text/markdown)
       │     │
       │     └─ Error:
       │        └─ Return error message
       │
       └─ Display Notes:
          ├─ [Expand/Collapse Button]
          ├─ Generated Notes Content
          │  └─ Formatted as text/markdown
          └─ [View/Collapse Toggle]
```

---

## 6. Data Flow: Request to Response

```
Frontend Component
        │
        ├─ User Action
        │ (click button, submit form)
        │
        ↓
State Update
├─ setLoading(true)
├─ setError('')
└─ API Call
        │
        ├─ axios request
        │ (via api/client.js)
        │
        ├─ Request Interceptor:
        │ ├─ Get token from localStorage
        │ └─ Add Authorization header
        │
        ↓
Backend API Endpoint
├─ POST /api/documents/upload
├─ GET /api/subtopics/:id
└─ [Other endpoints]
        │
        ↓
Response from Backend:
{
  success: true/false,
  data: { ... } or null,
  error: "message" or null
}
        │
        ├─ Response Interceptor:
        │ ├─ Check status
        │ ├─ If 401: logout + redirect
        │ └─ Return response
        │
        ↓
Component handles response
├─ Success:
│  ├─ setData(response.data.data)
│  ├─ setLoading(false)
│  └─ setError('')
│
└─ Error:
   ├─ setError(error.message)
   ├─ setLoading(false)
   └─ optionally: retry or notify user
        │
        ↓
UI Re-renders
├─ Update loading state
├─ Display data OR error
└─ User sees result
```

---

## 7. Local Storage Management

```
localStorage
│
├─ Key: "firebaseToken"
│  ├─ Value: JWT token string
│  ├─ Set: On login/register success
│  ├─ Used: Request interceptor (in Authorization header)
│  └─ Cleared: On logout or 401 response
│
└─ Key: "currentUser"
   ├─ Value: JSON stringified user object
   │  {
   │    _id: "...",
   │    email: "...",
   │    firstName: "...",
   │    lastName: "...",
   │    bio: "..."
   │  }
   ├─ Set: On login/register/profile update
   ├─ Used: AuthContext initialization, displaying user info
   └─ Cleared: On logout or account deletion
```

---

## 8. Error Handling Flow

```
API Request Fails
        │
        ↓
Response Interceptor
├─ Status 401?
│  ├─ Yes: Clear localStorage
│  ├─ Yes: Redirect to /login
│  └─ Return error
│
└─ Other status?
   └─ Return error
        │
        ↓
Component catch block
├─ Extract error message
│  ├─ error.response.data.error
│  ├─ or generic message
│
├─ Update state
│  └─ setError(errorMessage)
│
└─ Render error UI
   └─ Show in alert/notification
```

---

## 9. Form Validation Flow

```
User fills Form → onChange events → Update state
        │
        ↓
User clicks Submit
        │
        ├─ validateForm()
        │  ├─ Check email format
        │  ├─ Check password length
        │  ├─ Check required fields
        │  ├─ Check password match
        │  └─ Return errors object
        │
        ├─ Has errors?
        │  ├─ Yes: Display errors, return
        │  └─ No: Continue
        │
        ↓
API Call
        │
        ├─ Success: Redirect to next page
        └─ Error: Show error message
```

---

## 10. Page Navigation Map

```
Entry Point: http://localhost:5173/

                    ↓
            Is user logged in?
            
           ├─ No ──→ ProtectedRoute
           │        └─ Redirect to /login
           │
           └─ Yes → Render page + Navigation
                    │
                    ├─ Dashboard
                    │  ├─ View documents
                    │  ├─ Upload files
                    │  └─ Click → /document/:id
                    │
                    ├─ DocumentDetail
                    │  ├─ View subtopics
                    │  ├─ Generate notes
                    │  └─ Back → /dashboard
                    │
                    ├─ Profile
                    │  ├─ Edit info
                    │  ├─ Delete account
                    │  └─ Back → /dashboard
                    │
                    └─ Navigation Bar
                       ├─ Logo → /dashboard
                       ├─ Dashboard link
                       ├─ Profile link
                       └─ Logout button → /login


Public Routes (no Navigation):

/login ────────→ Login.jsx
                 Success → /dashboard

/register ─────→ Register.jsx
                 Success → /dashboard
```

---

This comprehensive diagram shows:
- ✅ Component hierarchy and nesting
- ✅ Data flow from user action to API and back
- ✅ Authentication state management
- ✅ Error handling paths
- ✅ Form validation flow
- ✅ File upload process
- ✅ Navigation structure
- ✅ Local storage usage

**All diagrams correspond to the actual implementation in the frontend code!**
