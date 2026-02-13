# Video Streaming Platform

A full-stack video streaming application built with the MERN stack (MongoDB, Express, React, Node.js) and TypeScript. This platform allows users to upload, watch, and interact with video content seamlessly.

## Features

- **User Authentication**: Secure sign-up and login functionality using JWT.
- **Video Upload**: Upload videos with cloud storage integration (Cloudinary).
- **Video Streaming**: Smooth video playback experience.
- **Interactive Features**: Like, comment, and engage with video content.
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, Mongoose
- **Database**: MongoDB
- **Authentication**: JSON Web Tokens (JWT)
- **Cloud Storage**: Cloudinary (for video and thumbnail storage)

## Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB (Local or Atlas)
- npm or yarn
- Cloudinary Account (for media storage)

## Installation

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the `backend` directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The backend server will start on `http://localhost:5000`.

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

## Scripts

### Backend
- `npm run dev`: Start the server in development mode with hot-reloading (nodemon).
- `npm run build`: Compile TypeScript to JavaScript in the `dist` folder.
- `npm start`: Run the compiled production server.

### Frontend
- `npm run dev`: Start the Vite development server.
- `npm run build`: Build the application for production.
- `npm run preview`: Locally preview the production build.
