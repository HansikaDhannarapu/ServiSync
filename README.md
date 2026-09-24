# ServiSync

**Smart Services. Seamless Solutions.**

ServiSync is a MERN capstone project for describing home service problems, getting an assisted category suggestion, finding suitable providers, comparing quotes, booking and following a job, then keeping the invoice and service history together.

## Project overview

People often know what is wrong at home but not which trade to call. ServiSync starts with the problem description, suggests a category and useful skills, and gives customers a clear path to quotes and service tracking. Suggestions are editable and are not a technical diagnosis.

### Objectives and USP

- Connect problem descriptions to service skills and local provider profiles.
- Show why providers match through a weighted, understandable score.
- Keep the service lifecycle visible: request → quote → booking → job updates → invoice → review or dispute.
- Keep a student sized monolithic MERN architecture that can be explained in a viva.

## Features

- Customer registration, cookie based login, role protected pages and backend ownership checks.
- Eight service categories, assisted rule based classification, editable suggestions and matching reasons.
- Provider profiles, quotes, date/time bookings, booking status flow and server side overlap prevention.
- Completion invoices, customer reviews, disputes, support resolution, notifications and admin analytics.
- Provider verification controls, operations booking view, audit records and demo seed data.
- Responsive React interface with customer, provider, operations, support and admin workspaces.

## User roles

| Role | Main access |
| --- | --- |
| CUSTOMER | Own requests, quotes, bookings, invoices, reviews and disputes |
| SERVICE_PROVIDER | Matching requests, own quotes, assigned jobs and own profile |
| OPERATIONS_MANAGER | Platform bookings and operational overview |
| SUPPORT_AGENT | Customer disputes and resolutions |
| PLATFORM_ADMIN | Users, providers, categories, audit log and analytics |

Public registration always creates a CUSTOMER. Other demo roles are created by the seed script.

## Technology stack

- Frontend: React, Vite, React Router, Zustand, Axios, react-hook-form, responsive CSS.
- Backend: Node.js, Express, Mongoose, MongoDB, JWT cookies, bcryptjs, Multer and Cloudinary.
- AI: backend-only `aiService.js`; local rule based fallback keeps problem classification available without an API key.

## Architecture

The Vite React app calls the Express REST API with HTTP-only cookies. Express routes validate the signed-in user and role, then use Mongoose models and small service modules for AI suggestions, provider scoring, availability and notifications. MongoDB stores users, provider profiles, categories, skills, requests, quotes, availability, bookings, invoices, reviews, disputes, notifications and audit logs.

The matching score uses 35% required skills, 20% category, 15% service area and 15% availability/workload, with the remaining 15% split across rating, experience and similar completed jobs. Availability is checked by the API when a booking is created. A booking overlap returns HTTP 409.

## Folder structure

```text
ServiSync/
├── frontend/                 # React/Vite application
│   └── src/                  # pages, API client, auth store and styles
├── backend/                  # Express API
│   ├── app.js                 # REST routes and middleware setup
│   ├── server.js              # Mongo connection and API startup
│   ├── middleware/           # Authentication and error handling
│   ├── models/               # Mongoose domain models
│   ├── seed/                 # Explicit demo data seeder
│   └── services/              # AI fallback, matching, availability, notifications
├── package.json              # Root convenience scripts
└── README.md
```

## Installation

Install a current Node.js LTS release and MongoDB Community or create a MongoDB Atlas database. From the project root:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

Create `backend/.env` from `backend/.env.example`. Set `MONGO_URI` and a long random `JWT_SECRET`. The default local Mongo URI is included in the example. Copy `frontend/.env.example` to `frontend/.env` if the API is not at `http://localhost:5000/api`.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign cookie sessions |
| `CLIENT_URL` | Frontend origin allowed by CORS (comma separated origins supported) |
| `PORT` | API port, default 5000 |
| `AI_API_KEY` | Reserved for a configured AI provider; local classification fallback works without it |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary image uploads |
| `VITE_API_URL` | Frontend API base URL, default `http://localhost:5000/api` |

Never commit real `.env` files. Images require Cloudinary credentials; the UI/API report a clear configuration message when unavailable. Uploads accept JPG, PNG and WebP up to 5 MB.

## Run locally

```bash
# Start both processes at the root
npm run dev

# Or start separately
npm run dev --prefix backend
npm run dev --prefix frontend
```

Frontend: `http://localhost:5173` · API: `http://localhost:5000/api` · Health: `http://localhost:5000/api/health`.

## Seed data and demo credentials

Run the seeder explicitly after MongoDB is available; the server never reseeds automatically:

```bash
npm run seed
```

All seeded accounts use **`ServiSync@2026`**.

| Account | Role |
| --- | --- |
| `customer@servisync.demo` | Customer |
| `provider@servisync.demo` | Service provider |
| `operations@servisync.demo` | Operations manager |
| `support@servisync.demo` | Support agent |
| `admin@servisync.demo` | Platform admin |

Additional fictional customers and providers are also seeded. The customer account includes an AC repair request and a sample quote.

## API overview

Core routes: `/api/auth`, `/api/categories`, `/api/skills`, `/api/providers`, `/api/requests`, `/api/quotes`, `/api/availability`, `/api/bookings`, `/api/invoices`, `/api/reviews`, `/api/disputes`, `/api/notifications`, `/api/admin`, and `/api/operations/bookings`. The API uses JSON and cookie credentials. Auth endpoints include register, login, logout and current user.

## AI integration and fallback

`backend/services/aiService.js` isolates classification from routes and returns category, skills, priority, summary and optional follow-up questions. With `AI_API_KEY`, the backend tries OpenAI and validates its structured result; local rules keep the flow usable when the service is unavailable. It is an assisted suggestion only; customers can edit the category before matching. No AI result grants access or changes authorization.

## Testing

Useful checks:

```bash
npm test --prefix backend
npm run build --prefix frontend
node --check backend/server.js
```

Backend unit tests cover local classification, category override, interval overlap math, and role middleware denial. A local MongoDB run was also used to exercise registration, quote creation, booking status updates, invoice creation, reviews, dispute resolution, analytics access, and conflict responses. MongoDB is required to run the API and seeder.

## Deployment

- **Vercel:** create a project from this repository with `frontend/` as the root directory. The included `frontend/vercel.json` serves React Router routes through the Vite entry point. Set `VITE_API_URL` to the deployed API `/api` URL.
- **Render:** connect the repository using the included root `render.yaml` Blueprint. Set the generated API's `MONGO_URI`, `CLIENT_URL`, and `PUBLIC_API_URL` values. Add AI and Cloudinary credentials only if those integrations are needed.
- **MongoDB Atlas:** create a database user, allow the Render service network, and use the Atlas connection URI for `MONGO_URI`.

Use HTTPS in production so secure HTTP-only cookies are sent. `CLIENT_URL` must exactly match the deployed frontend origin. Set `PUBLIC_API_URL` to the HTTPS backend origin. Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` for production image uploads; local disk fallback is development-only. The `AI_API_KEY` is optional because rule-based classification remains available.

## Future improvements

Add automated browser coverage, expand provider scheduling into selectable slots, and introduce real payment processing only if the project scope requires it.

## Current scope notes

AI uses the OpenAI API when `AI_API_KEY` is configured and otherwise uses local rules. Payment is represented by invoice status and is not collected. Deployment configuration is prepared, but a hosted deployment still requires a connected Git repository, hosting accounts, and environment values. Seed data is fictional.
