Cloud Drive — Project Documentation
Author: Iker Oikarinen
Last updated: 2026-01-31
A full-stack “cloud drive” web application for managing text documents. Users can register and log in, create and edit documents stored in MongoDB, share read-only public links, and grant edit access to other users.

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
