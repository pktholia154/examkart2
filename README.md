# ExamKart - Full Stack Learning & Exam Engine

ExamKart is a full-stack, offline-capable exam preparation, eBook reader, and test practice web application. Built with Next.js 15, React 19, Tailwind CSS, Dexie (IndexedDB), and Firebase Firestore/Auth.

---

## 🛠️ Project Setup & Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## ☁️ Google Cloud Platform (GCP) Deployment

This application includes a multi-stage `Dockerfile`, `cloudbuild.yaml`, and automated deployment scripts configured for **Google Cloud Run** and **GitHub Repository Integration**.

For detailed step-by-step instructions on setting up automatic GitHub deployment triggers, Artifact Registry, and Cloud Build, refer to:
👉 **[DEPLOYMENT_GCP.md](./DEPLOYMENT_GCP.md)**

### Quick Commands:
```bash
# Build Docker image locally
npm run docker:build

# Run Docker container locally
npm run docker:run

# Deploy directly to Google Cloud Run
GCP_PROJECT_ID="your-project-id" npm run deploy:gcp
```

---

## 📑 Key Technologies & Architecture

- **Next.js 15 App Router**: Standalone build configuration (`output: 'standalone'`).
- **Dexie.js / IndexedDB**: Local-first offline exam and eBook storage.
- **Firebase Firestore & Auth**: Cloud persistence and authentication synchronization.
- **Google Cloud Run**: Serverless container hosting with auto-scaling.
- **Google Cloud Build**: Automated CI/CD directly connected to GitHub repository.
