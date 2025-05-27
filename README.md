Notes API
A simple Node.js + Express + MySQL API for managing notes with user authentication.
Setup

Install dependencies: npm install
Set up MySQL database and create tables (see SQL above).
Create a .env file with database credentials and JWT secret.
Run the server: npm start

API Endpoints
Authentication

POST /api/auth/register - Register a new user
POST /api/auth/login - Login and receive JWT

Notes (Authenticated)

POST /api/notes - Create a new note
GET /api/notes - Get all notes for the user
GET /api/notes/:id - Get a specific note
PUT /api/notes/:id - Update a note
DELETE /api/notes/:id - Delete a note

Authentication

Include JWT in the Authorization header as Bearer <token> for protected routes.

