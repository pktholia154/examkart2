# Deploying to Google Cloud Platform (GCP) via GitHub Repository

This document guides you through deploying the **ExamKart App** directly to **Google Cloud Run** using a **GitHub Repository** and **Google Cloud Build**.

---

## 🏗️ Architecture Overview

- **Framework**: Next.js 15 (App Router) with Standalone Output (`output: 'standalone'`).
- **Containerization**: Multi-stage `Dockerfile` running Node 20 Alpine.
- **CI/CD**: Google Cloud Build pipeline (`cloudbuild.yaml`) triggered directly on GitHub pushes.
- **Container Registry**: GCP Artifact Registry (`asia-southeast1-docker.pkg.dev`).
- **Runtime Host**: Google Cloud Run (Fully Managed Serverless Container).
- **Database / Auth**: Firebase Firestore & Firebase Auth.

---

## 🚀 Option 1: Automated Continuous Deployment with GitHub Triggers

Connect your GitHub repository directly to GCP Cloud Build so that every push to the `main` branch automatically builds and deploys your container to Cloud Run.

### Step 1: Enable GCP Required Services
Open Google Cloud Shell or your local terminal with `gcloud` authenticated, and run:

```bash
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com
```

### Step 2: Create an Artifact Registry Repository
Create a Docker repository to store built container images:

```bash
gcloud artifacts repositories create app-repo \
  --repository-format=docker \
  --location=asia-southeast1 \
  --description="Docker repository for ExamKart App"
```

### Step 3: Connect GitHub Repository to Cloud Build
1. Go to the [Google Cloud Build Triggers Console](https://console.cloud.google.com/cloud-build/triggers).
2. Select your GCP Project.
3. Click **Connect Repository** (2nd Gen Repository link).
4. Select **GitHub** as the provider and authorize Google Cloud Build to access your GitHub account.
5. Select your repository (e.g., `your-username/examkart-app`).
6. Click **Create Trigger**:
   - **Name**: `deploy-examkart-main`
   - **Event**: Push to a branch
   - **Branch**: `^main$`
   - **Configuration**: `Cloud Build configuration file (yaml)`
   - **Location**: `/cloudbuild.yaml`
   - **Substitutions**:
     - `_LOCATION`: `asia-southeast1`
     - `_REPOSITORY`: `app-repo`
     - `_SERVICE_NAME`: `examkart-app`

### Step 4: Grant Cloud Build Deployment Permissions
Allow Cloud Build to deploy to Cloud Run:
```bash
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format='value(projectNumber)')

gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud iam service-accounts add-iam-policy-binding \
  ${PROJECT_NUMBER}-compute@developer.gserviceaccount.com \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

Now, every time you commit and push to `main` in GitHub, Cloud Build will build the Docker container and deploy it to Cloud Run automatically!

---

## ⚡ Option 2: Direct CLI Deployment Script

If you want to deploy directly from your local terminal or a shell pipeline without waiting for GitHub webhook triggers:

```bash
# Set your GCP Project ID
export GCP_PROJECT_ID="your-gcp-project-id"

# Run the deployment script
npm run deploy:gcp
# or: bash deploy-gcp.sh
```

The script automatically:
1. Enables Cloud Build, Cloud Run, and Artifact Registry APIs.
2. Creates the Artifact Registry repository if missing.
3. Submits the code to Cloud Build and builds the container image.
4. Deploys the image to Google Cloud Run listening on port `3000`.

---

## 🐳 Option 3: Testing Docker Container Locally

Before deploying, you can build and run the container on your workstation:

```bash
# Build the Docker image
npm run docker:build

# Run the Docker container
npm run docker:run
```

Open [http://localhost:3000](http://localhost:3000) in your browser to inspect the application.

---

## 🔐 Environment Variables & Secrets Configuration

### Cloud Run Environment Variables
Set production environment variables on your Cloud Run service via `gcloud` or GCP Console:

```bash
gcloud run services update examkart-app \
  --region=asia-southeast1 \
  --set-env-vars="GEMINI_API_KEY=your-gemini-key,APP_URL=https://your-app-url.a.run.app"
```

### Using GCP Secret Manager (Recommended for Sensitive Keys)
```bash
# 1. Create a secret
echo -n "your-secret-key" | gcloud secrets create GEMINI_API_KEY --data-file=-

# 2. Grant Cloud Run access to Secret Manager
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# 3. Mount secret to Cloud Run
gcloud run services update examkart-app \
  --region=asia-southeast1 \
  --update-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest"
```

---

## 📁 Repository Files Reference

- `Dockerfile`: Multi-stage Docker build optimized for Next.js standalone output.
- `.dockerignore`: Filters build context to maximize Docker cache speed.
- `cloudbuild.yaml`: Pipeline configuration for Google Cloud Build.
- `deploy-gcp.sh`: One-command deployment script.
- `next.config.ts`: Configured with `output: 'standalone'`.
- `.env.example`: Template for environment variables.
