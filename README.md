# 🐾 PawPoint - Veterinary Management System

A full-stack veterinary clinic management system built with modern web technologies. PawPoint enables pet owners to manage their pets, book appointments, and track medical records, while veterinarians can manage their schedules, appointments, and treatment records.

For Database (MII212501) Project. Supervised by Drs. Edi Winarko, M.Sc.,Ph.D.

## Members
- Deira Aisya Refani (24/532821/PA/22539)
- Ratu Faiha Salsabilla (24/532756/PA/22533)
- Aufaa Azzahra Aryawan (24/546854/PA/23215)

## 🌟 Features

### For Pet Owners
- 📝 **Pet Management**: Register and manage multiple pets with detailed profiles (name, species, breed, age, gender)
- 📅 **Appointment Booking**: Schedule appointments with veterinarians at specific clinics
- 🏥 **Appointment Tracking**: View appointment history and status (scheduled, completed, cancelled)
- 📋 **Medical Records**: Access pet medical records and treatment history
- 👤 **Profile Management**: Manage personal information and contact details

### For Veterinarians
- 📆 **Schedule Management**: Create and manage weekly availability schedules
- 📋 **Appointment Management**: View assigned appointments and update their status
- 💊 **Treatment Records**: Create detailed treatment records including diagnosis, prescriptions, and recommendations
- 🏥 **Multi-Clinic Support**: Work across multiple veterinary clinics
- 📊 **Dashboard**: Overview of today's appointments and upcoming schedules

### For Administrators
- 👥 **User Management**: View and manage all users (pet owners, veterinarians, admins)
- 🏥 **Clinic Management**: Create and manage veterinary clinic information
- 🔗 **Veterinarian-Clinic Assignment**: Assign veterinarians to specific clinics
- 📊 **Reports & Analytics**: 
  - Appointments by status (scheduled, completed, cancelled)
  - Appointments by clinic
  - Treatment records overview
- 📈 **System Dashboard**: Real-time statistics and insights

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 4.1.18
- **Routing**: React Router DOM 7.11.0
- **HTTP Client**: Axios 1.13.2
- **State Management**: React Context API (Authentication)
- **Deployment**: Vercel

### Backend
- **Framework**: Flask 3.1.0
- **Language**: Python 3.x
- **Database Driver**: psycopg2-binary 2.9.10
- **Authentication**: Flask-JWT-Extended 4.7.1 (JWT tokens with 1-hour expiration)
- **Password Hashing**: Werkzeug (scrypt algorithm)
- **CORS**: Flask-CORS 5.0.0
- **Server**: Gunicorn (production)
- **Deployment**: Render

### Database
- **Database**: PostgreSQL 15+
- **Cloud Provider**: Supabase
- **Connection Pooling**: psycopg2 SimpleConnectionPool (maxconn=2 for free tier)
- **Features**:
  - Connection pool management to prevent exhaustion
  - SSL/TLS encryption for secure connections
  - Automatic connection cleanup and reuse

### Development Tools
- **Version Control**: Git/GitHub
- **Package Managers**: npm (frontend), pip (backend)
- **Environment Variables**: python-dotenv
- **Code Quality**: ESLint (frontend)

## 🌐 Production Deployment

### Live URLs
- **Frontend**: [https://db-project-group10-paw-point.vercel.app](https://db-project-group10-paw-point.vercel.app)
- **Backend API**: [https://dbproject-group10-pawpoint.onrender.com](https://dbproject-group10-pawpoint.onrender.com)
- **Database**: Supabase (PostgreSQL Cloud)

### Test Accounts
```
Admin Account:
Email: admin@pawpoint.com
Password: admin123

Veterinarian Account:
Email: victor@pawpoint.com
Password: vet123

Pet Owner Account:
Email: sarah@pawpoint.com
Password: owner123
```

## 📁 Project Structure

```
week4_integration/
├── frontend/                  # Frontend React + Vite
│   ├── src/
│   │   ├── pages/
│   │   │   ├── public/       # Landing, Login, Register
│   │   │   ├── owner/        # Dashboard, Pets, PetDetail, Appointments
│   │   │   ├── vet/          # Dashboard, Appointments, Treatments, Schedule
│   │   │   └── admin/        # Dashboard, Users, Clinics, Reports
│   │   ├── components/       # Navbar, Footer, ProtectedRoute
│   │   ├── contexts/         # AuthContext (JWT management)
│   │   ├── services/         # api.js (Axios HTTP client)
│   │   ├── App.jsx           # Main routing
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Tailwind styles
│   ├── public/               # Static assets
│   ├── package.json          # Frontend dependencies
│   ├── vite.config.js        # Vite configuration
│   ├── vercel.json           # Vercel SPA routing config
│   └── .env                  # Environment variables (VITE_API_BASE_URL)
│
└── backend/                   # Backend Flask + PostgreSQL
    ├── app.py                # Main Flask application (1400+ lines)
    ├── db.py                 # Database connection pool management
    ├── requirements.txt      # Python dependencies
    ├── .env                  # Environment variables (DB credentials)
    └── README.md             # Backend documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- PostgreSQL 15+ (or Supabase account)
- Git

### Local Development Setup

#### 1. Clone Repository
```bash
git clone https://github.com/deiraaisyar/DBProject_Group10_PawPoint.git
cd DBProject_Group10_PawPoint/week4_integration
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=yourpassword
# DB_NAME=pawpoint
# DB_SSLMODE=prefer
# JWT_SECRET_KEY=your-secret-key

# Run backend
python app.py
```

Backend will run at `http://localhost:5000`

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
echo "VITE_API_BASE_URL=http://localhost:5000" > .env

# Run frontend dev server
npm run dev
```

Frontend will run at `http://localhost:5173`

### Database Setup

#### Option 1: Local PostgreSQL

```bash
# Create database
createdb pawpoint

# Run schema (from week2)
psql -U postgres -d pawpoint -f ../week2_schema_SQL/final/ddl_schema.sql
psql -U postgres -d pawpoint -f ../week2_schema_SQL/final/insert_admin.sql
psql -U postgres -d pawpoint -f ../week2_schema_SQL/final/insert_data.sql
psql -U postgres -d pawpoint -f ../week2_schema_SQL/final/insert_veterinarian.sql
psql -U postgres -d pawpoint -f ../week2_schema_SQL/final/triggers.sql
```

#### Option 2: Supabase Cloud

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy connection string from Settings > Database
3. Use Supabase SQL Editor to run schema files
4. Update `.env` with Supabase credentials

## 🔑 API Endpoints

### Authentication
- `POST /register` - Register new user (pet_owner, veterinarian, admin)
- `POST /login` - Login and get JWT token
- `GET /profile` - Get current user profile (requires JWT)

### Pet Management (Pet Owner, Admin)
- `GET /pets` - Get all pets (filtered by owner for pet_owner role)
- `GET /pets/:id` - Get specific pet details
- `POST /pets` - Create new pet
- `PUT /pets/:id` - Update pet information
- `DELETE /pets/:id` - Delete pet

### Appointment Management
- `GET /appointments` - Get appointments (filtered by role)
- `GET /appointments/:id` - Get appointment details
- `POST /appointments` - Create new appointment
- `PUT /appointments/:id` - Update appointment
- `PUT /appointments/:id/status` - Update appointment status (vet, admin)

### Veterinarian Management
- `GET /veterinarians` - Get all veterinarians
- `GET /veterinarians/:id` - Get veterinarian details
- `GET /veterinarians/clinic/:clinicId` - Get vets by clinic
- `POST /veterinarians` - Create veterinarian record (admin)
- `GET /veterinarians/:id/schedules` - Get vet schedules
- `POST /veterinarian-schedules` - Create schedule (vet, admin)

### Clinic Management (Admin)
- `GET /clinics` - Get all clinics
- `GET /clinics/:id` - Get clinic details
- `POST /clinics` - Create new clinic
- `PUT /clinics/:id` - Update clinic

### Treatment Records (Vet, Admin)
- `GET /treatments` - Get all treatment records
- `GET /treatments/:id` - Get treatment details
- `POST /treatments` - Create treatment record
- `PUT /treatments/:id` - Update treatment record

### Reports (Admin)
- `GET /reports/appointments/status` - Appointments grouped by status
- `GET /reports/appointments/clinic` - Appointments grouped by clinic
- `GET /reports/treatments` - Treatment records overview

### User Management (Admin)
- `GET /users` - Get all users
- `GET /users/:id` - Get user details

## 🔐 Authentication & Authorization

### JWT Token Flow
1. User logs in with email/password
2. Backend validates credentials and generates JWT token (1-hour expiration)
3. Token includes user_id and role in claims
4. Frontend stores token in localStorage
5. All protected routes require `Authorization: Bearer <token>` header
6. Token refresh on page reload via AuthContext

### Role-Based Access Control
- **pet_owner**: Can manage own pets and appointments
- **veterinarian**: Can manage schedules, view assigned appointments, create treatment records
- **admin**: Full access to all resources, user management, reports

### Password Security
- Passwords hashed using Werkzeug's scrypt algorithm (32768 rounds, 8 blocks)
- Salt automatically generated per password
- Secure password verification without timing attacks

## 🗄️ Database Schema

### Core Tables
- **user**: User accounts (pet owners, vets, admins)
- **role**: User roles (pet_owner, veterinarian, admin)
- **user_role**: User-role mapping (many-to-many)
- **pet**: Pet information (name, species, breed, age, etc.)
- **pet_owner**: Pet ownership records with address
- **clinic**: Veterinary clinic information
- **veterinarian**: Veterinarian profiles with license numbers
- **veterinarian_clinic**: Vet-clinic assignments (many-to-many)
- **veterinarian_schedule**: Weekly schedules (day, time_start, time_end)
- **appointment**: Appointment bookings with status tracking
- **treatment_record**: Medical treatment details (diagnosis, prescription, recommendations)

### Key Features
- Foreign key constraints for referential integrity
- CHECK constraints for data validation
- DEFAULT values for timestamps (CURRENT_TIMESTAMP)
- Automatic ID generation with SERIAL
- ON CONFLICT clauses for upsert operations

## 🔧 Key Technical Implementations

### Connection Pool Management
```python
# db.py - Prevents connection pool exhaustion
SimpleConnectionPool(
    minconn=1,
    maxconn=2,  # Optimized for Supabase free tier
    connect_timeout=10,
    statement_timeout=30000  # 30 seconds
)

# app.py - Connection wrapper for automatic cleanup
class ConnectionWrapper:
    def close(self):
        # Returns connection to pool instead of closing
        release_connection(self._conn)
```

### Frontend API Service
```javascript
// services/api.js - Centralized HTTP client
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatic JWT token injection
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Protected Routes
```javascript
// components/ProtectedRoute.jsx
// Redirects to login if not authenticated
// Checks role-based permissions
<ProtectedRoute requiredRole="veterinarian">
  <VetDashboard />
</ProtectedRoute>
```

## 🚢 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set build settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `week4_integration/frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add environment variable: `VITE_API_BASE_URL=https://your-backend.onrender.com`
4. Deploy automatically on git push

### Backend (Render)
1. Create new Web Service on Render
2. Connect GitHub repository
3. Set build settings:
   - **Root Directory**: `week4_integration/backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
4. Add environment variables:
   ```
   DB_HOST=your-supabase-host.pooler.supabase.com
   DB_PORT=6543
   DB_USER=postgres.your-project-id
   DB_PASSWORD=your-password
   DB_NAME=postgres
   DB_SSLMODE=require
   JWT_SECRET_KEY=your-secret-key
   ```
5. Deploy automatically on git push

### Database (Supabase)
1. Create project on [supabase.com](https://supabase.com)
2. Use SQL Editor to run schema files
3. Get connection details from Settings > Database
4. Use **Session Pooler** (port 6543) for better connection management

## 📝 Development Notes

### MySQL to PostgreSQL Migration
Backend has been fully adapted for PostgreSQL:
- ✅ Using `psycopg2` driver instead of MySQL connector
- ✅ `%s` parameter binding (PostgreSQL compatible)
- ✅ `RETURNING` clause for auto-generated IDs
- ✅ `ON CONFLICT` for upsert operations (PostgreSQL specific)
- ✅ Table names in double quotes for reserved keywords (`"user"`)
- ✅ `SERIAL` instead of `AUTO_INCREMENT`
- ✅ `TIMESTAMP` instead of `DATETIME`
- ✅ `CHECK` constraints instead of `ENUM` types

### Connection Pool Optimization
- Configured `maxconn=2` for Supabase free tier to prevent exhaustion
- Implemented `ConnectionWrapper` class to ensure connections are properly returned to pool
- Added `connect_timeout=10` and `statement_timeout=30000` for reliability
- All endpoints use connection pooling for efficient resource management

### Security Best Practices
- Passwords never stored in plain text
- JWT tokens expire after 1 hour
- CORS configured to allow specific origins only
- SQL injection prevention via parameterized queries
- Environment variables for sensitive credentials
- SSL/TLS required for database connections

## 🐛 Troubleshooting

### Backend won't connect to database
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# For Supabase, test connection
python backend/test_supabase.py

# Verify credentials in .env file
cat backend/.env
```

### Frontend can't reach backend
```bash
# Verify backend is running
curl http://localhost:5000/clinics

# Check CORS headers
curl -H "Origin: http://localhost:5173" -I http://localhost:5000/clinics

# Verify environment variable
cat frontend/.env
```

### Connection pool exhausted error
- Check `maxconn` setting in `backend/db.py`
- Verify all endpoints properly close connections
- Consider switching from Session Pooler (6543) to Transaction Mode (5432) for Supabase
- Monitor connection usage in Supabase dashboard

### JWT token expired
- Tokens expire after 1 hour by default
- User must login again to get new token
- Frontend automatically redirects to login on 401 errors

### 404 errors on page refresh (Vercel)
- Ensure `vercel.json` exists in frontend directory with rewrite rules
- This enables client-side routing for React SPA

### Port already in use
```bash
# Backend (5000)
lsof -ti:5000 | xargs kill -9

# Frontend (5173)
lsof -ti:5173 | xargs kill -9
```

## 📚 Additional Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

