# FleetDoc Full-Stack

FleetDoc is now organized as a React/Vite frontend backed by a Python/FastAPI API and PostgreSQL.

## Stack

- Frontend: React, Vite, Tailwind, Framer Motion
- Backend: Python 3.12+, FastAPI, SQLAlchemy 2, Pydantic v2
- Database: PostgreSQL 16
- Migrations: Alembic
- Auth: JWT access/refresh tokens, Argon2 password hashing
- Jobs: APScheduler
- Payments: Razorpay integration with webhook verification
- Messaging: SMTP, Twilio/MSG91 SMS, Meta WhatsApp Cloud API
- Uploads: FastAPI multipart upload

## First run (local)

### 1. Database
Install PostgreSQL or run:

    docker compose up -d db

### 2. Backend

    cd backend
    python -m venv .venv
    # Windows: .venv\Scripts\activate
    # Linux/macOS: source .venv/bin/activate
    pip install -r requirements.txt
    copy .env.example .env     # Windows
    # cp .env.example .env     # Linux/macOS
    uvicorn app.main:app --reload --port 8000

API docs: http://localhost:8000/docs

The development seed creates:

    Email: admin@fleetdoc.local
    Password: Admin@123

Change these values in `.env` before any real deployment.

### 3. Frontend

    cd frontend
    npm install
    copy .env.example .env
    npm run dev

The frontend expects:

    VITE_API_URL=http://localhost:8000/api/v1

## Docker

Copy `backend/.env.example` to `backend/.env`, change `DATABASE_URL` to:

    postgresql+psycopg://fleetdoc:fleetdoc@db:5432/fleetdoc

Then:

    docker compose up --build

## Authentication and OTP

Forgot password:

1. User enters registered email.
2. Backend checks the account.
3. Backend creates a cryptographically generated OTP and stores only its digest.
4. OTP is sent through SMTP.
5. OTP expires automatically and is limited to five attempts.
6. User resets the password after successful verification.

User verification has equivalent email and SMS OTP endpoints.

In development, `DEV_RETURN_OTP=true` returns the OTP in the API response to make local testing possible. Set it to `false` in production.

## Notification providers

Real delivery requires credentials:

- Email: SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, SMTP_FROM_EMAIL
- SMS: Twilio or MSG91 credentials
- WhatsApp: Meta WhatsApp Cloud API access token, phone number ID and approved template
- Premium notification channels are enforced by the backend subscription check

Without credentials, the development backend logs delivery attempts instead of claiming real delivery.

## Payment gateway

Razorpay is integrated using:

- POST `/api/v1/payments/create-order`
- POST `/api/v1/payments/verify`
- POST `/api/v1/payments/webhook/razorpay`

Configure:

    RAZORPAY_KEY_ID
    RAZORPAY_KEY_SECRET
    RAZORPAY_WEBHOOK_SECRET

Never put Razorpay secret keys in React.

## Main API groups

- `/api/v1/auth`
- `/api/v1/users`
- `/api/v1/vehicles`
- `/api/v1/documents`
- `/api/v1/loans`
- `/api/v1/emis`
- `/api/v1/challans`
- `/api/v1/road-taxes`
- `/api/v1/notifications`
- `/api/v1/settings`
- `/api/v1/payments`
- `/api/v1/files`
- `/api/v1/dashboard`

## Production checklist

- Use PostgreSQL, not SQLite
- Set a long random `SECRET_KEY`
- Set `DEV_RETURN_OTP=false`
- Configure SMTP/SMS/WhatsApp credentials
- Configure Razorpay production credentials and webhook
- Put HTTPS in front of the API
- Restrict `CORS_ORIGINS`
- Store uploads in durable object storage for multi-instance deployments
- Run Alembic migrations in CI/CD
- Back up PostgreSQL
- Add monitoring and log aggregation
- Rotate secrets and API keys regularly

## API credentials still required from you

I have deliberately left these as environment variables because they are account-specific:

1. SMTP/email provider credentials
2. SMS provider credentials (Twilio/MSG91 or your chosen provider)
3. Meta WhatsApp Cloud API credentials/template
4. Razorpay key ID, secret and webhook secret
5. Any government vehicle/challan API credentials you have

Do not paste production secrets into the source code. Put them in `backend/.env`.
