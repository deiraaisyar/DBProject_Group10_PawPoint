Simple React frontend for the PawPoint backend (minimal demo)

Run locally:

1. Install dependencies

```bash
cd week4_integration/frontend
npm install
```

2. Start dev server

```bash
npm run dev
```

The frontend expects the Flask backend to be running at `http://localhost:5000`. If your backend is at a different address, set the environment variable `VITE_API_BASE` before running dev server, e.g. `export VITE_API_BASE=http://localhost:5000`.

Notes:
- This is a minimal demo UI. It provides simple create/list forms for `users`, `owners`, `pets`, and `appointments` to match the backend routes.
- Add validations and routing as needed.
