# Deployment Guide

This project consists of two parts: `api` (Backend) and `web` (Frontend).
To deploy this successfully to Vercel, you need to deploy them as **two separate projects** and use a cloud database.

## Prerequisites

1.  **GitHub Account**: Push this code to a GitHub repository.
2.  **Vercel Account**: Connect your GitHub account to Vercel.
3.  **Cloud Database**: Since Vercel cannot host your local MySQL database, you need a cloud provider.
    *   **Option A**: [PlanetScale](https://planetscale.com/) (MySQL compatible, free tier).
    *   **Option B**: [Railway](https://railway.app/) or [Supabase](https://supabase.com/).
    *   *Note*: If you skip this, your API will not work on Vercel.

---

## Step 1: Deploy the Database

1.  Create a MySQL database on your chosen provider (e.g., PlanetScale).
2.  Get the **Connection URL** (e.g., `mysql://user:pass@host/dbname`).
3.  You will need this for the API Environment Variables.

## Step 2: Deploy the Backend (API)

1.  Go to Vercel Dashboard -> **Add New** -> **Project**.
2.  Select your GitHub repository.
3.  **Important**: In "Root Directory", click `Edit` and select `api`.
4.  Open **Environment Variables**:
    *   `DB_HOST`: Your cloud database host.
    *   `DB_USER`: Your cloud database user.
    *   `DB_PASS`: Your cloud database password.
    *   `DB_NAME`: Your cloud database name.
    *   `JWT_SECRET`: A random secret string (e.g., `my-super-secret-key`).
5.  Click **Deploy**.
6.  Once deployed, copy the **Production Domain** (e.g., `https://crm-api-xyz.vercel.app`).

## Step 3: Deploy the Frontend (Web)

1.  Go to Vercel Dashboard -> **Add New** -> **Project**.
2.  Select the **same** GitHub repository.
3.  **Important**: In "Root Directory", click `Edit` and select `web`.
4.  Open **Environment Variables**:
    *   `VITE_API_URL`: Paste the API URL from Step 2 (e.g., `https://crm-api-xyz.vercel.app`).
5.  Click **Deploy**.

## Step 4: Run Migrations

Your cloud database is empty. You need to create the tables.
Since you can't easily run the migration script on Vercel, run it locally **connected to the cloud DB**:

1.  In your local `api/.env`, temporarily replace the DB credentials with your **Cloud DB** credentials.
2.  Run `npm run migrate` (inside `api` folder).
3.  (Optional) Run `npm run seed`.
4.  **Revert** your local `api/.env` to `localhost` when done.

Now your deployed website should work!
