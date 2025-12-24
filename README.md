# Live Inventory – DevOps CI/CD Automation Project

**Live Inventory** is a production-ready, containerized web application with **end-to-end DevOps automation**.  
The project demonstrates **real-world CI/CD pipelines using Jenkins and GitHub Actions**, automated Docker deployments, and **email alerting for pipeline status**.

---

## 🚀 Project Overview

Live Inventory is a web-based inventory management system that supports real-time item tracking.  
The application is fully automated with CI/CD pipelines to ensure **fast, reliable, and zero-manual deployments**.

---

## 🧠 DevOps Highlights

- ✅ CI/CD using **Jenkins**
- ✅ CI/CD using **GitHub Actions**
- 🐳 Dockerized application
- 🔁 Automated deployment on code push
- 📧 Email alerts on build & deployment status
- ⚙️ Environment-based configuration
- 🚀 Zero manual intervention

---

## 🛠 Tech Stack

| Layer | Technology |
|------|-----------|
| Backend | Python (Flask) |
| Frontend | HTML, CSS, JavaScript |
| Containerization | Docker, Docker Compose |
| CI/CD | Jenkins, GitHub Actions |
| Notifications | Email Alerts |
| Version Control | GitHub |

---

## ⚙️ CI/CD Architecture

Developer Push Code
↓
GitHub Repository
↓
┌───────────────┐
│ GitHub Actions│
│ (CI Pipeline) │
└───────────────┘
↓
Docker Build
↓
Jenkins Pipeline
↓
Automated Deployment
↓
Email Notification


## 🧩 Jenkins Pipeline Responsibilities

- Pull latest code from GitHub
- Build Docker image
- Run application container
- Deploy updated version
- Send **email alerts** on:
  - ✅ Build success
  - ❌ Build failure
  - 🚀 Deployment status

✔ Real-time feedback  
✔ Faster issue detection  

---

## 📧 Email Alerting

Email notifications are configured in Jenkins to notify stakeholders about pipeline status.

### Alerts Triggered On:
- Build Success
- Build Failure
- Deployment Completion

This ensures:
- 📢 Immediate visibility
- 🔍 Faster troubleshooting
- 📊 Production reliability

---

## 🐳 Dockerized Application

### Run Locally Using Docker

git clone https://github.com/surajlearninig-bit/Live_Inventory.git
cd Live_Inventory
docker compose up --build

📂 Project Structure

Live_Inventory/
├── app.py                    # Flask application
├── Dockerfile                # Docker image
├── docker-compose.yml        # Container orchestration
├── requirements.txt          # Python dependencies
├── static/                   # Frontend assets
├── templates/                # HTML templates
└── .github/workflows/        # GitHub Actions CI

🔐 Environment Variables

FLASK_APP=app.py
FLASK_ENV=production
DATABASE_URL=

🚀 Deployment Strategy

GitHub Actions handles CI (build & validation)
Jenkins handles CD (deployment & monitoring)
Email alerts ensure deployment transparency

✔ Reliable
✔ Scalable
✔ Production-ready


🔮 Future Enhancements

-☁️ Cloud deployment (AWS / Azure)
-🗄 PostgreSQL / MySQL integration
-📊 Monitoring (Prometheus + Grafana)
-🔐 Secrets management (Vault)
-🔁 Blue-Green / Rolling deployments
-👨‍💻 DevOps Engineer Notes

This project demonstrates:

Real Jenkins pipeline implementation
CI/CD integration with GitHub
Docker-based deployment automation
Monitoring via email notifications
Industry-standard DevOps workflow

👤 Author

Suraj
DevOps Engineer
GitHub: https://github.com/surajlearninig-bit
