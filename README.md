# Hotel Booking System

## Project Overview
The Hotel Booking System is a full-stack web application designed to manage hotel room bookings. The system provides an intuitive interface for users to browse available rooms, make reservations, and manage their bookings. It also includes an admin panel for hotel staff to manage rooms, view booking statistics, and handle customer requests.

## Features
- **User Authentication**: Secure login and registration system
- **Room Browsing**: Filter and search rooms by various criteria
- **Booking Management**: Create, view, modify, and cancel bookings
- **Payment Processing**: Simulated payment system for bookings
- **User Dashboard**: Personal area for users to manage their reservations
- **Admin Panel**: Complete management system for hotel administrators

## Technologies Used
### Frontend
- React with TypeScript
- Vite as build tool
- TailwindCSS for styling
- Context API for state management
- React Router for navigation

### Backend
- Node.js with Express
- TypeScript
- MongoDB/Mongoose (database)
- JWT for authentication
- RESTful API architecture

## Setup and Installation

### Prerequisites
- Node.js (v14.x or higher)
- npm or yarn
- MongoDB (local or Atlas connection)

### Installation Steps

1. Backend Setup
```
cd backend
npm install
```

2. Fill the info in the `.env` file in the backend directory with the following content:
```
MONGODB_COLLECTION_STRING=
JWT_SECRET_KEY=
FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

STRIPE_API_KEY=

EMAIL_USER=
EMAIL_PASSWORD=
```

4. Frontend Setup
```
cd ../frontend
npm install
```

5. Check the `.env` file in the frontend directory:

### Running the Application

1. Start the backend server:
```
cd backend
npm run dev
```

2. In a new terminal, start the frontend:
```
cd frontend
npm run dev
```

3. Access the application at `http://localhost:5173` in your browser

## Project Structure

### Backend
- `src/index.ts` - Entry point
- `src/routes/` - API route definitions
- `src/models/` - Database models
- `src/middleware/` - Custom middleware
- `src/utils/` - Helper functions
- `src/config/` - Configuration files

### Frontend
- `src/main.tsx` - Entry point
- `src/App.tsx` - Main application component
- `src/pages/` - Page components
- `src/components/` - Reusable UI components
- `src/context/` - React Context definitions
- `src/utils/` - Helper functions
- `src/types/` - TypeScript interfaces and types
- `src/api-clients.ts` - API communication

## API Documentation

The API follows RESTful conventions and includes endpoints for:
- Authentication (/api/auth)
- Users (/api/users)
- Rooms (/api/rooms)
- Bookings (/api/bookings)
- Reviews (/api/reviews)
