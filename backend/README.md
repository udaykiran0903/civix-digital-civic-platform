# Civiv Backend Setup

This backend uses environment variables for database, JWT, and OTP email delivery.

## 1. Install dependencies

```bash
npm install
```

## 2. Create your local .env

Copy the example file:

```powershell
Copy-Item .env.example .env
```

Then edit `.env` and set your own values.

## 3. Required environment variables

- `PORT` - backend port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - long random secret for signing auth tokens
- `EMAIL_USER` - Gmail address used to send OTP
- `EMAIL_PASS` - Gmail App Password (16 chars), not your normal Gmail password
- `OTP_DEV_MODE`
  - `true`: OTP is logged in console (dev only)
  - `false`: OTP is sent by email

## 4. Run the server

```bash
npm start
```

If your project uses `nodemon` in development, use the dev script configured in `package.json`.

## Important security notes

- Do not commit `.env` to GitHub.
- Never share real email/app-password credentials in chat, screenshots, or commits.
- In production, set the same variables in your hosting provider's Environment Variables settings.
