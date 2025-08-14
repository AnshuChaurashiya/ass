# Udyam Registration (Steps 1 & 2) - MERN + Tailwind

This project mimics the first two steps of the Udyam registration process. It includes:

- React (Vite + TypeScript) frontend with Tailwind CSS
- Node.js (Express) backend with validation (Joi) and MongoDB storage (Mongoose)
- Dynamic forms rendered from JSON schemas (served by backend)
- Basic Puppeteer scraper to extract form fields

## Prerequisites

- Node 18+
- MongoDB running locally or in the cloud (set `MONGODB_URI`)

## Getting Started

Backend:

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open the frontend at `http://localhost:5174`. The frontend expects the backend at `http://localhost:4000` (configure via `VITE_API_BASE_URL`).

## Scraper

```bash
cd scraper
npm init -y
npm install puppeteer
node scrapeUdyam.js
```

Outputs will be saved to `scraper/output`. You can manually review and copy the generated JSON into `backend/schemas/*` to update the live schema.

## Validation Rules

- Aadhaar: 12 digits `^\d{12}$`
- OTP: 6 digits `^\d{6}$`
- PAN: `^[A-Z]{5}[0-9]{4}[A-Z]{1}$`

## Notes

- This code is a starter. You can extend Step 2 to include additional fields (entity type, name, DOB, etc.) as per the real portal.
- Add tests in `backend` using Jest and `supertest`.


