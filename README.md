# EventEase

**EventEase** is a full-stack event management and workshop registration platform. Visitors can discover events and register for available seats, while administrators manage events and attendees through a protected dashboard.

## Live Demo

- **Public website:** https://event-ease-nu-three.vercel.app/
- **Admin login:** https://event-ease-nu-three.vercel.app/admin/login
- **Backend health check:** https://eventease-api-gslv.onrender.com/api/health

## Features

### Public Website
- Browse available events and workshops.
- View event descriptions, dates, locations, and seat availability.
- Register for an event.
- Prevent duplicate registrations for the same event and email.
- Enforce event capacity on the backend.

### Admin Dashboard
- Secure login using email and password.
- JWT-based authentication for protected operations.
- View event and registration statistics.
- Create, edit, and delete events.
- View event attendees and remove registrations.
- Update seat availability when registrations change.

## Tech Stack

- **Frontend:** React, Vite, React Router, CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB, Mongoose
- **Authentication:** JSON Web Tokens (JWT), bcryptjs
- **API Testing:** Thunder Client
- **Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas (database)
- **Version Control:** Git and GitHub

## Architecture

```text
Visitors / Administrators
          |
          v
React + Vite Frontend (Vercel)
          |
          | REST API requests
          v
Express Backend (Render)
          |
          | Mongoose
          v
MongoDB Atlas
```

The frontend communicates with the Express REST API. Public endpoints provide event information and handle registrations. Protected admin endpoints require a valid JWT. MongoDB stores event, administrator, and registration data.

## Project Structure

```text
EventEase/
├── client/
│   └── src/
│       ├── admin/
│       │   ├── AdminLogin.jsx
│       │   ├── AdminDashboard.jsx
│       │   └── Admin.css
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       └── main.jsx
└── server/
    ├── config/
    │   └── db.js
    ├── middleware/
    │   └── authMiddleware.js
    ├── models/
    │   ├── Admin.js
    │   ├── Event.js
    │   └── Registration.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── eventRoutes.js
    │   └── registrationRoutes.js
    ├── scripts/
    └── server.js
```

## API Overview

All routes use the `/api` base path.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Check API status |
| `POST` | `/api/auth/login` | Public | Log in as an administrator |
| `GET` | `/api/events` | Public | Retrieve all events |
| `GET` | `/api/events/:id` | Public | Retrieve one event |
| `POST` | `/api/events` | Admin | Create an event |
| `PUT` | `/api/events/:id` | Admin | Update an event |
| `DELETE` | `/api/events/:id` | Admin | Delete an event when allowed |
| `POST` | `/api/registrations/:eventId` | Public | Register for an event |
| `GET` | `/api/registrations/:eventId` | Admin | View event attendees |
| `DELETE` | `/api/registrations/:eventId/:registrationId` | Admin | Remove a registration |

Protected requests require an admin token in the `Authorization` header as a Bearer token.

## Security

- Administrator passwords are hashed using bcrypt.
- JWT authentication protects administrative API operations.
- Duplicate registrations are prevented at the database/application level.
- Event capacity is enforced by the backend.
- Environment files and credentials should remain private and must not be committed to GitHub.

## Future Improvements

Potential improvements include email confirmations, event categories and filtering, pagination, automated tests, and password-reset functionality.

---

Built as a full-stack project to practise frontend development, REST API design, database integration, authentication, and deployment.
