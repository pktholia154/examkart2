#!/usr/bin/env bash
set -e

# Configuration defaults (Override via environment variables)
PROJECT_ID=${GCP_PROJECT_ID:-$(gcloud config get-value project 2>/dev/null || echo "")}
REGION=${GCP_REGION:-"asia-southeast1"}
SERVICE_NAME=${GCP_SERVICE_NAME:-"examkart-app"}
REPOSITORY=${GCP_REPOSITORY:-"app-repo"}

if [ -z "$PROJECT_ID" ]; then
  echo "Error: GCP Project ID is required."
  echo "Please set GCP_PROJECT_ID environment variable or run 'gcloud config set project <PROJECT_ID>'."
  echo "Usage: GCP_PROJECT_ID=my-project-id ./deploy-gcp.sh"
  exit 1
fi

echo "===================================================="
echo " Deploying $SERVICE_NAME to Google Cloud Run "
echo " Project ID: $PROJECT_ID"
echo " Region:     $REGION"
echo " Repository: $REPOSITORY"
echo "===================================================="

# 1. Enable required GCP services
echo "[1/4] Enabling required Google Cloud APIs..."
gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com --project="$PROJECT_ID"

# 2. Ensure Artifact Registry repository exists
echo "[2/4] Verifying Artifact Registry repository..."
if ! gcloud artifacts repositories describe "$REPOSITORY" --location="$REGION" --project="$PROJECT_ID" >/dev/null 2>&1; then
  echo "Creating Artifact Registry repository '$REPOSITORY' in region '$REGION'..."
  gcloud artifacts repositories create "$REPOSITORY" \
    --repository-format=docker \
    --location="$REGION" \
    --description="Docker repository for $SERVICE_NAME" \
    --project="$PROJECT_ID"
fi

IMAGE_URI="$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$SERVICE_NAME:latest"

# 3. Build container using Cloud Build
echo "[3/4] Building container image via Google Cloud Build..."
gcloud builds submit --tag "$IMAGE_URI" --project="$PROJECT_ID" .

# 4. Deploy image to Cloud Run
echo "[4/4] Deploying image to Google Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --image="$IMAGE_URI" \
  --region="$REGION" \
  --platform=managed \
  --allow-unauthenticated \
  --port=3000 \
  --set-env-vars="NODE_ENV=production" \
  --project="$PROJECT_ID"

echo "===================================================="
echo " Deployment successful!"
echo " Service URL: $(gcloud run services describe "$SERVICE_NAME" --platform=managed --region="$REGION" --project="$PROJECT_ID" --format='value(status.url)')"
echo "===================================================="
