# Student Login Connection Issue

## Resolution

Student login depends on:

- A working backend API URL from environment configuration.
- A reachable frontend app URL from environment configuration.
- Valid database credentials stored only in `.env`.

## Verification

1. Start the backend with the values from `backend/server/.env`.
2. Start the frontend with the values from `frontend/.env`.
3. Verify the backend health endpoint using the API base URL from your environment.
4. Test student and teacher login with your local test users.

## Rule

Keep secrets, database connection strings, and deployment URLs in `.env` files only.
