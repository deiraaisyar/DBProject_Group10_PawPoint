# PawPoint - Week 4 Integration (Backend + Frontend)

Ini adalah folder untuk integrasi backend dan frontend PawPoint.

## Struktur Folder

```
week4_integration/
├── frontend/               # Frontend React + Vite
│   ├── src/               # Source code React
│   │   ├── pages/         # Page components (owner, vet, admin, public)
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # Context API (AuthContext)
│   │   ├── services/      # API services
│   │   ├── App.jsx        # Main App component
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   ├── vite.config.js     # Vite configuration
│   ├── postcss.config.js  # PostCSS config
│   ├── eslint.config.js   # ESLint config
│   └── README.md          # Frontend documentation
│
└── backend/               # Backend Flask + PostgreSQL
    ├── app.py            # Main Flask application
    ├── db.py             # Database connection (PostgreSQL)
    ├── requirements.txt  # Python dependencies
    ├── .env.example      # Environment variables template
    ├── .gitignore        # Git ignore rules
    └── README.md         # Backend documentation
```

## Quick Start

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Setup .env
cp .env.example .env
# Edit .env dengan PostgreSQL credentials

# Run backend
python app.py
```

Backend akan berjalan di `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run frontend dev server
npm run dev
```

Frontend akan berjalan di `http://localhost:5173` dengan proxy ke backend di `/api`

## Database Setup

Pastikan PostgreSQL sudah installed dan running, kemudian:

```bash
# Create database
createdb pawpoint

# Run schema (dari week2)
psql -U postgres -d pawpoint -f ../week2_schema_SQL/final/ddl_schema.sql
psql -U postgres -d pawpoint -f ../week2_schema_SQL/final/insert_admin.sql
psql -U postgres -d pawpoint -f ../week2_schema_SQL/final/insert_data.sql
psql -U postgres -d pawpoint -f ../week2_schema_SQL/final/insert_veterinarian.sql
psql -U postgres -d pawpoint -f ../week2_schema_SQL/final/triggers.sql
```

## Key Changes from MySQL to PostgreSQL

Backend telah di-adapt untuk PostgreSQL:
- Menggunakan `psycopg2` driver
- `%s` parameter binding (sudah support PostgreSQL)
- `RETURNING` clause untuk auto-generated IDs
- `ON CONFLICT` untuk upsert (PostgreSQL specific)
- Table names dalam quotes untuk reserved words

## Development

- Frontend: React 19 + Vite + Tailwind CSS
- Backend: Flask + Flask-JWT-Extended + Flask-CORS
- Database: PostgreSQL
- Authentication: JWT

## Testing

### Test Backend API
```bash
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### Test Frontend
Buka `http://localhost:5173` di browser

## Notes

- Semua data sudah diimport dari week2 schema
- Authentication menggunakan JWT token
- CORS sudah dikonfigurasi untuk frontend
- Backend proxy di vite.config.js merewrite requests ke `/api`

## Documentation

- [Backend README](./backend/README.md) - Detail backend API
- [Frontend README](./frontend/README.md) - Detail frontend setup

## Troubleshooting

### Backend won't connect to DB
- Pastikan PostgreSQL running: `pg_isrunning` atau `sudo systemctl status postgresql`
- Pastikan credentials di `.env` benar
- Pastikan database `pawpoint` sudah dibuat

### Frontend can't reach backend
- Pastikan backend running di `localhost:5000`
- Cek vite.config.js proxy configuration
- Check browser console untuk CORS errors

### Port already in use
```bash
# Backend (5000)
lsof -i :5000 | grep LISTEN

# Frontend (5173)
lsof -i :5173 | grep LISTEN
```
