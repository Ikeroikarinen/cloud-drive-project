Cloud Drive — Project Documentation
Author: Iker Oikarinen
Last updated: 2026-01-31
A full-stack “cloud drive” web application for managing text documents. Users can register and log in, create and edit documents stored in MongoDB, share read-only public links, and grant edit access to other users.
<<<<<<< HEAD

1. Technology choices
   Backend (backend/)
   Node.js + Express (TypeScript)
   MongoDB + Mongoose
   Authentication: JWT (jsonwebtoken)
   Password hashing: bcrypt
   Validation: zod
   CORS: cors
   Environment variables: dotenv
   Dev server: ts-node-dev
   Frontend (frontend/)
   React + TypeScript
   Vite
   TailwindCSS
2. Installation guidelines
   Ports must be under 60000.
   2.1 Prerequisites
   Node.js (LTS recommended)
   MongoDB (local or cloud, e.g. MongoDB Atlas)
   2.2 Environment variables
   Create these .env files:
   backend/.env
   PORT=3001
   MONGODB_URI=mongodb://127.0.0.1:27017/cloud_drive
   JWT_SECRET=change_this_to_a_long_random_secret
   CORS_ORIGIN=http://localhost:5173
   frontend/.env
   VITE_API_BASE_URL=http://localhost:3001
   2.3 Install dependencies
   Backend:
   cd backend
   npm install
   Frontend:
   cd ../frontend
   npm install
   2.4 Run in development mode
   Backend:
   cd backend
   npm run dev
   Frontend (second terminal):
   cd frontend
   npm run dev
   Open: http://localhost:5173
   2.5 Build & run (production-like)
   Backend:
   cd backend
   npm run build
   npm start
   Frontend:
   cd frontend
   npm run build
   npm run preview
3. User manual
   3.1 Register & login
   Open the frontend in the browser.
   Register a user account.
   Log in with the same credentials.
   After login, you can access your private drive.
   3.2 Documents (private drive)
   Authenticated users can:
   Create a new document
   Edit document content
   Rename a document (if implemented in UI)
   Delete a document (if implemented in UI)
   All document data is stored in MongoDB.
   3.3 Public read-only link
   A document can be shared via a public link:
   Non-authenticated users can open it in read-only mode.
   Editing is not allowed in public mode.
   3.4 Sharing edit access (permissions)
   Document owner can grant edit access to other existing users:
   The invited user must already be registered.
   Users with permission can edit the document when logged in.
   3.5 Logout
   Use the logout action to end the session (typically clears token from client storage).
   3.6 Edit lock (prevent simultaneous editing)
   The intended behavior:
   Two users cannot edit the same document at the same time.
   If another user is editing, show an informative message (locked state).
   If a user closes the tab while editing, the lock should expire (timeout) or allow resuming.
   If implemented, document here:
   Lock timeout: <e.g. 60 seconds>
   Lock refresh interval: <e.g. 20 seconds>
   UI message shown: <short description>
4. Features implemented & target points
   Base requirements (documentation + mandatory features) = 25 points.
   Optional features add up to maximum total 50 points.
   Fill this table before submission (mark ✅/❌ and update points):
   Feature Points Implemented
   Mandatory project requirements + documentation 25 ✅
   React frontend (framework) 3 ✅
   WYSIWYG editor 2 ❌
   Download document as PDF 3 ❌
   Show created + updated timestamps 1 ❌
   Sorting documents 1 ❌
   Profile picture stored on server 2 ❌
   Dark/bright mode 1 ❌
   Recycle bin 2 ❌
   Clone document 1 ❌
   Upload images to drive 2 ❌
   UI translation (2+ languages) 2 ❌
   Search 2 ❌
   Pagination 2 ❌
   Automated tests (min 10 cases) 4 ❌
   Own feature (describe) n ❌
   Target points:
   25 + (sum of implemented optional points) = \_\_ / 50
   Own feature description (if used):
   <Describe your own feature and why it is relevant to the project theme>
5. AI usage declaration (MANDATORY)
   Update this section to match your real usage. You must either declare AI usage clearly or declare that no AI tools were used.
   AI tools used:
   ChatGPT: Yes/No
   GitHub Copilot: Yes/No
   Other: None
   How and where AI was used:
   <Example: proofreading and improving clarity of this documentation>
   <Example: brainstorming feature list and structure of README>
   <Example: debugging and suggesting fixes based on error logs>
   <Example: generating small code snippets which were reviewed and adapted>
   Authorship statement:
   I wrote and integrated the final code myself.
   I reviewed AI suggestions and verified correctness and course requirement compliance.
   If no AI was used, replace the above with:
   “No AI assistance or tools were used in this assignment.”
6. Known limitations (optional)
   <List any known limitations, e.g. "No automated tests", "No WYSIWYG editor", etc.>
7. License
   Backend: ISC (default from backend/package.json)
   Frontend: Private (as per frontend/package.json)
=======
Repository structure
backend/
src/
middleware/
auth.ts
models/
Document.ts
User.ts
routes/
auth.ts
documents.ts
public.ts
utils/
jwt.ts
index.ts
package.json
tsconfig.json
frontend/
public/
vite.svg
src/
assets/
App.tsx
App.css
index.css
main.tsx
index.html
package.json
vite.config.ts
tsconfig*.json
Tech stack
Backend (backend/)
Node.js + Express
MongoDB + Mongoose
Authentication: JWT (jsonwebtoken)
Password hashing: bcrypt
Validation: zod
CORS: cors
Environment variables: dotenv
TypeScript runtime dev server: ts-node-dev
Frontend (frontend/)
React + TypeScript
Vite
TailwindCSS (installed)
Requirements coverage (what the app supports)
Mandatory requirements (base)
Node.js backend + database storage
Register + login
Authenticated users can create/edit/rename/delete their documents
Share a document with a public read-only link
Grant edit permission to other existing users
Prevent simultaneous editing (edit lock) (if implemented; see “Edit lock” section)
Logout
Responsive UI (works on desktop and mobile)
Optional features (if implemented)
See “Points & feature checklist” section.
Setup and running locally
Ports must be under 60000.
Prerequisites
Node.js (LTS recommended)
MongoDB (local or cloud, e.g. MongoDB Atlas)
Environment variables
Create the following .env files:
backend/.env
Create backend/.env with:
PORT=3001
MONGODB_URI=mongodb://127.0.0.1:27017/cloud_drive
JWT_SECRET=change_this_to_a_long_random_secret
CORS_ORIGIN=http://localhost:5173
frontend/.env
Create frontend/.env with:
VITE_API_BASE_URL=http://localhost:3001
Install dependencies
Backend
cd backend
npm install
Frontend
cd ../frontend
npm install
Run in development mode
Backend (dev)
cd backend
npm run dev
Frontend (dev)
Open a second terminal:
cd frontend
npm run dev
Open the app:
http://localhost:5173
Build & run (production-like)
Backend
cd backend
npm run build
npm start
Frontend
cd frontend
npm run build
npm run preview
User manual
Register & login
Open the frontend in the browser.
Register a user account.
Log in with the same credentials.
After login, you can access your private drive.
Documents (private drive)
Authenticated users can:
Create a new document
Edit document content
Rename a document (if implemented in UI)
Delete a document (if implemented in UI)
All document data is stored in MongoDB (no “in-memory only” storage).
Public read-only link
A document can be shared via a public link:
Non-authenticated users can open it in read-only mode.
Editing is not allowed in public mode.
Sharing edit access (permissions)
Document owner can grant edit access to other existing users:
The invited user must already be registered.
Users with permission can edit the document when logged in.
Logout
Use the logout action to end the session (typically clears token from client storage).
Edit lock (prevent simultaneous editing)
The intended behavior for edit locking is:
Two users cannot edit the same document at the same time.
If another user is editing, show an informative message (locked state).
If a user closes the tab while editing, the lock should eventually expire (timeout) or allow the same user to resume.
Typical implementation strategy:
Store lock info in the document record (e.g. lockedBy, lockExpiresAt)
Acquire lock on editor open, refresh lock while editing, release lock on exit or allow expiration
If your project has a lock timeout, document it here:
Lock timeout: <e.g. 60 seconds>
Lock refresh interval: <e.g. 20 seconds>
UI message shown: <short description>
Backend API overview (route files)
Backend routes are organized into:
backend/src/routes/auth.ts
backend/src/routes/documents.ts
backend/src/routes/public.ts
Below is an overview of typical endpoints (exact paths depend on how routes are mounted in backend/src/index.ts):
Auth
POST /api/auth/register
POST /api/auth/login
Documents (authenticated)
GET /api/documents — list documents available to the user (own + shared)
POST /api/documents — create document
GET /api/documents/:id — get document
PUT /api/documents/:id — update document (title/content)
DELETE /api/documents/:id — delete document
POST /api/documents/:id/permissions — grant/revoke editor permissions (if implemented)
POST /api/documents/:id/share — create/revoke public link (if implemented)
Public (no auth)
GET /api/public/:token — read-only view by public token (if implemented)
Security notes
Passwords are hashed using bcrypt and never stored as plain text.
JWT is used to protect private endpoints.
CORS is restricted by CORS_ORIGIN (backend .env).
Never commit real .env files.
Points & feature checklist (fill before submission)
Mandatory (base 25p)
 Node.js backend
 Database used, all data stored in DB
 Register + login
 Authenticated user can create/edit/rename/delete their docs
 Grant edit permission to existing users
 Public link: non-auth read-only view
 No simultaneous editing (edit lock) + informative message
 Closing tab while editing: lock expiry / resume possible
 Logout
 Responsive UI (mobile + desktop)
 Documentation included (this file)
 AI usage declaration included
Optional features (0–25p extra, max total 50p)
Mark what you implemented:
 Frontend framework (React) (+3)
 WYSIWYG editor (+2)
 PDF download (+3)
 Created + updated timestamps shown (+1)
 Sorting documents (+1)
 Profile picture stored on server (+2)
 Dark/bright mode (+1)
 Recycle bin (+2)
 Clone document (+1)
 Upload images to drive (+2)
 UI translation (2+ languages) (+2)
 Search (+2)
 Pagination (+2)
 Automated tests (min 10 cases) (+4)
 Own feature (+n) — describe below
Own feature description (if used):
<Describe your own feature and why it is relevant to the project theme>
Target points:
Base 25 + optional = __ / 50
AI usage declaration (MANDATORY)
Update this section to match your real usage.
AI tools used:
ChatGPT: Yes/No
GitHub Copilot: Yes/No
Other: None
How AI was used:
<Example: brainstorming app features and architecture>
<Example: debugging errors and suggesting fixes>
<Example: drafting parts of this documentation and proofreading>
Authorship statement:
I wrote and integrated the final code myself.
I reviewed AI suggestions and verified correctness and course requirement compliance.
If no AI was used, replace the above with: “No AI tools were used in this project.”
Known limitations (optional)
<List any known limitations, e.g. "No automated tests", "No WYSIWYG editor", etc.>
License
Backend: ISC (default from backend/package.json)
Frontend: Private (as per frontend/package.json)
>>>>>>> 8347e3b7af0193fc0b6ac15a75ecf501016c4ce9
