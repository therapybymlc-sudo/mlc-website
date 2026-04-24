# Deploy Backend To Render Using A Prebuilt GHCR Image

This repo includes a GitHub Actions workflow that builds the Django backend Docker image and pushes it to GHCR.

## What You Get

- Image tags:
  - `ghcr.io/<owner>/mlc-website-backend:latest`
  - `ghcr.io/<owner>/mlc-website-backend:<git-sha>`

The Docker build uses:

- Docker context: `backend`
- Dockerfile: `backend/Dockerfile`

## Step 1: Trigger A Build

- Push to `main` with any change under `backend/`, or
- Run the workflow manually in GitHub Actions.

## Step 2: Allow Render To Pull The Image

If your GHCR package is private (typical), Render needs registry credentials.

1. GitHub → Settings → Developer settings → Personal access tokens
2. Create a classic token (PAT) with:
   - `read:packages`
   - `repo` (needed for private packages in many setups)

## Step 3: Create A New Render Service (Image Deploy)

Render cannot always switch an existing "Docker from repo" service to "Image" cleanly, so do this as a controlled cutover:

1. Render Dashboard → New → Web Service
2. Choose "Deploy an existing image"
3. Image URL: `ghcr.io/<owner>/mlc-website-backend:<git-sha>` (recommended) or `:latest`
4. Registry credentials:
   - Username: your GitHub username
   - Password: the PAT from Step 2
5. Set the same environment variables as your current backend service.

## Step 4: Swap The Domain

1. Add your production hostname (example `api.mlchealth.in`) to the new service.
2. Remove it from the old service.

If the domain is managed outside Render, keep the DNS record the same; only the Render service binding changes.

## Notes

- Do not bake secrets into the Docker image. Keep them in Render env vars.
- This backend container already runs `python manage.py migrate --noinput` at startup (see `backend/Dockerfile`).

