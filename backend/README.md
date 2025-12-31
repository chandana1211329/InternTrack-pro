# Klassygo Backend

A comprehensive Node.js/Express backend API for managing user attendance, daily reports, and user administration.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Admin can create, update, and manage user accounts
- **Attendance Tracking**: Clock-in/clock-out functionality with automatic status calculation
- **Daily Reports**: Interns can submit daily work reports with time tracking
- **Admin Dashboard**: Comprehensive analytics and management tools
- **Data Validation**: Robust input validation and error handling
- **Security**: Helmet, CORS, and other security best practices

## Tech Stack

- **Node.js** with TypeScript
- **Express.js** for REST API
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/klassygo
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:5173
   ```

4. Start MongoDB (make sure it's running on your system)

5. Run the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Attendance
- `POST /api/attendance/clock-in` - Clock in for the day
- `PUT /api/attendance/clock-out/:attendanceId` - Clock out
- `GET /api/attendance/my-attendance` - Get own attendance history
- `GET /api/attendance/today` - Get today's attendance
- `GET /api/attendance/stats` - Get attendance statistics

### Daily Reports
- `POST /api/reports/submit` - Submit daily report
- `GET /api/reports/my-reports` - Get own reports
- `GET /api/reports/:reportId` - Get specific report
- `PUT /api/reports/:reportId` - Update report (pending only)
- `DELETE /api/reports/:reportId` - Delete report (pending only)

### Admin (Requires ADMIN role)
- `GET /api/admin/dashboard-stats` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:userId` - Update user
- `DELETE /api/admin/users/:userId` - Deactivate user
- `GET /api/admin/attendance` - Get all attendance records
- `GET /api/admin/reports` - Get all reports
- `PUT /api/admin/reports/:reportId/review` - Review and approve/reject report

## Data Models

### User
```typescript
{
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'INTERN';
  department?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
}
```

### Attendance
```typescript
{
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  clockInTime: string; // HH:MM
  clockOutTime?: string; // HH:MM
  status: 'PRESENT' | 'LATE' | 'ABSENT';
  totalHours?: number;
  notes?: string;
}
```

### DailyReport
```typescript
{
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  taskTitle: string;
  taskDescription: string;
  toolsUsed: string[];
  timeSpent: string; // "Xh Ym", "Xh", or "Ym"
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewComments?: string;
}
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Error Handling

The API uses standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

Error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [...] // For validation errors
}
```

## Development

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests

### Project Structure
```
src/
├── models/          # Mongoose models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── utils/           # Utility functions
└── server.ts        # Main server file
```

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Helmet security headers
- Rate limiting (can be added)

## Environment Variables

Required environment variables:
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRE` - Token expiration time (default: 7d)
- `FRONTEND_URL` - Frontend application URL for CORS

## Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Set production environment variables

3. Start the server:
   ```bash
   npm start
   ```

## License

ISC
