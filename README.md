#  FixIt — Handyman Service Website

A full-stack home services booking platform built with React, Node.js, Express, and MySQL.

---

##  Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React.js, React Router, Axios       |
| Backend     | Node.js, Express.js                 |
| Database    | MySQL                               |
| Auth        | JWT (JSON Web Tokens)               |
| Styling     | Custom CSS (Syne + DM Sans fonts)   |
| Alerts      | react-hot-toast                     |

---

##  Quick Start

### Prerequisites
- Node.js v18+
- MySQL 8+
- npm or yarn

---

### 1. Database Setup

```bash
mysql -u root -p < database/schema.sql
```

---

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DB credentials and JWT secret
npm run dev
```

The API will start on: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The app will start on: `http://localhost:3000`

---

##  Environment Variables (backend/.env)

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=handyman_db
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

---

##  Default Credentials

| Role     | Email                   | Password |
|----------|-------------------------|----------|
| Admin    | admin@handyman.com      | admin123 |

*(Create your own customer/provider accounts via /register)*

---

##  Project Structure

```
handyman-service-website/
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── Navbar.js
│       │   ├── ServiceCard.js
│       │   ├── BookingForm.js
│       │   └── ReviewForm.js
│       ├── context/
│       │   └── AuthContext.js
│       ├── pages/
│       │   ├── Home.js
│       │   ├── Login.js (+ Register export)
│       │   ├── Register.js
│       │   ├── Services.js
│       │   ├── BookingPage.js (+ BookingDetail)
│       │   ├── Dashboard.js
│       │   ├── Dashboard.Admin.js
│       │   └── Profile.js
│       ├── services/
│       │   ├── api.js
│       │   └── bookingService.js
│       ├── App.js
│       ├── App.css
│       └── index.js
│
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── serviceController.js
│   │   ├── bookingController.js
│   │   └── paymentController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Service.js
│   │   ├── Booking.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── serviceRoutes.js
│   │   ├── bookingRoutes.js
│   │   └── paymentRoutes.js
│   ├── server.js
│   └── package.json
│
├── database/
│   └── schema.sql
│
└── README.md
```

---

##  API Endpoints

### Auth
| Method | Endpoint            | Access  | Description              |
|--------|---------------------|---------|--------------------------|
| POST   | /api/auth/register  | Public  | Register user/provider   |
| POST   | /api/auth/login     | Public  | Login & get token        |
| GET    | /api/auth/me        | Private | Get current user         |
| PUT    | /api/users/profile  | Private | Update profile           |

### Services
| Method | Endpoint                         | Access  |
|--------|----------------------------------|---------|
| GET    | /api/services                    | Public  |
| GET    | /api/services/:id                | Public  |
| POST   | /api/services                    | Admin   |
| PUT    | /api/services/:id                | Admin   |
| DELETE | /api/services/:id                | Admin   |
| GET    | /api/providers                   | Public  |
| GET    | /api/admin/providers/pending     | Admin   |
| PATCH  | /api/admin/providers/:id/approve | Admin   |

### Bookings
| Method | Endpoint                      | Access     |
|--------|-------------------------------|------------|
| POST   | /api/bookings                 | Customer   |
| GET    | /api/bookings                 | Customer   |
| GET    | /api/bookings/:id             | Private    |
| PATCH  | /api/bookings/:id/status      | Provider   |
| GET    | /api/provider/bookings        | Provider   |
| GET    | /api/admin/bookings           | Admin      |

### Payments & Reviews
| Method | Endpoint                        | Access   |
|--------|---------------------------------|----------|
| POST   | /api/payments                   | Customer |
| GET    | /api/payments/booking/:id       | Private  |
| POST   | /api/reviews                    | Customer |
| GET    | /api/notifications              | Private  |
| PATCH  | /api/notifications/read         | Private  |
| GET    | /api/admin/stats                | Admin    |
 
---

##  Features

### Customer
-  Browse & search services
-  Book services with date/time selection
-  Track booking status in real-time
-  Multiple payment methods (UPI, Card, Cash)
-  Rate and review providers
-  In-app notifications

### Service Provider
-  Register and await approval
-  View assigned bookings
-  Update job status
-  View earnings history

### Admin
-  Platform-wide statistics
-  User management (activate/deactivate)
-  Approve service providers
-  Manage service catalog
-  Monitor all bookings

---

##  Design

- **Fonts**: Syne (headings) + DM Sans (body)
- **Theme**: Bold Industrial with orange (#f97316) accent
- **Responsive**: Mobile-first design

---

##  Security

- Passwords hashed with bcryptjs (10 rounds)
- JWT authentication with expiry
- Role-based route guards (customer / provider / admin)
- Input validation on all endpoints

