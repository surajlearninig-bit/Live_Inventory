🚀 Automated Inventory Management System with CI/CD
     This is a robust, end-to-end Automated Inventory Management System designed to collect system data from remote agents. This project demonstrates modern DevOps practices, including Containerization, CI/CD          pipelines, and Automated Database Backups.

🛠 Tech Stack
   Backend: Flask (Python)
   Database: SQLite3
   DevOps Tools: Docker, Docker Compose, Jenkins
   Scripting: Bash (Shell Scripting)
   Monitoring/Alerting: Gmail SMTP for Build Notifications

🏗 Key Features
    1. Dockerization & Data Persistence
       The entire application is containerized using Docker for environment consistency.
       Data Persistence: Implemented Docker Volumes to ensure the SQLite database remains intact even after Jenkins re-builds or container restarts.

   2. CI/CD Pipeline (Jenkins)
      Configured a Jenkins pipeline to automate the build and deployment process.
      Email Notifications: Integrated Gmail SMTP to send automated alerts regarding build status (Success/Failure) to the administrator.

   3. Automated Backup System 📂
      I developed a custom Bash Script to ensure data safety and high availability:
      Scheduled Backups: A Cron job triggers a .dump of the database daily at 3:00 PM.
     Log Management: Every backup activity is logged at /var/log/inventory_backup.log for auditing.
     Auto-Retention: To optimize storage, the script automatically deletes backups older than 7 days.

📂 Project Structure
Plaintext
.
├── main.py              # Core Flask Application logic
├── docker-compose.yml   # Docker services orchestration
├── Dockerfile           # Container build instructions
├── .env                 # Environment variables & Secrets
├── backup_script.sh     # Bash script for database automation
└── data/                # Persistent Volume for SQLite DB

⚠️ Challenges & Troubleshooting (My Learnings)


In a real-world DevOps environment, I encountered and resolved several critical issues:

Challenge: Data Loss During Deployment
Issue: Every time Jenkins deployed a new build, the container was replaced, and the SQLite data was wiped out.
Solution: Implemented Docker Bind Mounts (./data:/app/data) to map the database file to the Host VM's storage.

Challenge: Agent Connection Errors (Status 500)
Issue: The Agent failed to update data because the database tables did not exist on a fresh setup.
Solution: Developed a Self-Healing logic within main.py using an init_db() function that automatically checks and creates missing tables on startup.

Challenge: Linux File Permissions
Issue: The Docker container was unable to write to the host directory.
Solution: Used Linux permission management (chmod -R 777 ./data) to grant the necessary read/write access to the Docker engine.

Challenge: SMTP Authentication on Localhost
Issue: Gmail blocked the automated build alerts from the local Jenkins instance.
Solution: Configured Gmail App Passwords and updated Linux Firewall (UFW) rules to allow traffic on Port 587.


🚀 How to Run

Clone the repository.
Configure your credentials in the .env file.
Launch the application:
Bash
docker-compose up -d --build
Schedule the backup script via Crontab:


Bash
crontab -e
# Add this line:
0 15 * * * /path/to/backup_script.sh

👨‍💻 Developed By: Suraj Singh Tomar
This project allowed me to gain deep insights into Docker networking, Jenkins automation, and Linux server administration.
