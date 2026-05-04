# End-to-End AWS Deployment & CI/CD Guide (EC2 Edition)

This document outlines the complete process to deploy your full-stack application using **AWS Amplify** (Frontend) and **AWS EC2** (Backend), with fully automated Continuous Integration and Continuous Deployment (CI/CD) via GitHub Actions.

## Architecture Overview
*   **Frontend:** Hosted on **AWS Amplify**. Automatically builds and deploys your React code on pushes to GitHub.
*   **Backend:** Hosted on an **AWS EC2 instance (Ubuntu)** running Node.js managed by **PM2**.
*   **CI/CD Pipeline (Backend):** Powered by **GitHub Actions**. It securely copies files via SCP to the EC2 server and uses SSH to restart the Node.js application.

---

## Phase 1: Codebase Preparation

### 1.1 Dynamic API URLs in Frontend
Your frontend must dynamically point to your new EC2 server.
1. Create a `.env` file in the root of your project (for local development):
   ```env
   VITE_API_URL=http://localhost:3001
   ```
2. Ensure `src/services/geminiService.js` references this dynamically:
   ```javascript
   const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/gemini`;
   ```

---

## Phase 2: EC2 Server Setup (Backend)

We need to launch a Virtual Machine to host the Node.js server.

### 2.1 Launch the EC2 Instance
1. Log in to the [AWS Management Console](https://console.aws.amazon.com/).
2. Navigate to **EC2** -> **Instances** -> **Launch instances**.
3. **Name:** `antigravity-backend-server`.
4. **AMI:** Select **Ubuntu Server 24.04 LTS**.
5. **Instance type:** `t2.micro` or `t3.micro` (eligible for free tier).
6. **Key pair (login):** Click **Create new key pair**.
   *   Name it `antigravity-ec2-key`.
   *   Type: `RSA`, Format: `.pem`.
   *   *Save this file securely on your computer; you need it for CI/CD later!*
7. **Network settings:**
   *   Check **Allow SSH traffic** (Port 22).
   *   Check **Allow HTTP traffic** (Port 80).
   *   Click *Edit*, Add Custom TCP Rule -> Port **3001** -> Source: **Anywhere** (0.0.0.0/0).
8. Click **Launch instance**.

### 2.2 Install Dependencies on EC2
1. Find your instance's **Public IPv4 address** in the EC2 dashboard.
2. SSH into your server using your terminal (Mac/Linux) or PowerShell (Windows):
   ```bash
   ssh -i /path/to/antigravity-ec2-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
   ```
3. Once logged in, run these commands to install Node.js and PM2:
   ```bash
   # Update server
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2 (Process Manager to keep the backend running forever)
   sudo npm install -g pm2
   
   # Setup PM2 to restart on server reboot
   pm2 startup
   # Run the command PM2 prints out, then run:
   pm2 save
   ```

---

## Phase 3: Frontend Deployment & CI/CD (AWS Amplify)

### 3.1 Setup Amplify Hosting
1. Search for **AWS Amplify** in the AWS Console.
2. Click **Get Started** under *Amplify Hosting* -> **GitHub**.
3. Select your repository and the `main` branch.
4. **Important:** Check **"Connecting a monorepo?"** and enter `frontend` as the root directory.

### 3.2 Configure Environment Variables
1. Under **Advanced Settings**, add a new environment variable:
   *   **Key:** `VITE_API_URL`
   *   **Value:** `http://<YOUR_EC2_PUBLIC_IP>:3001`
2. Click **Save and deploy**.

*✅ Frontend CI/CD is complete. Pushing to `main` auto-deploys the frontend.*

---

## Phase 4: Backend CI/CD (GitHub Actions)

We will configure GitHub Actions to automatically copy your code to the EC2 server and restart PM2.

### 4.1 Add Secrets to GitHub
1. Open your repository on GitHub.
2. Go to **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.
3. Add the following secrets:
   *   `EC2_HOST`: The Public IP address of your EC2 instance.
   *   `EC2_USERNAME`: `ubuntu`
   *   `EC2_SSH_KEY`: Open the `.pem` file you downloaded earlier in a text editor. Copy the **entire contents** (including `-----BEGIN RSA PRIVATE KEY-----`) and paste it here.
   *   `GEMINI_API_KEY`: Your Gemini API Key.
   *   `GITHUB_TOKEN`: Your GitHub Token (for repository codebase analysis).

### 4.2 How the Pipeline Works
I have created the `.github/workflows/deploy-backend.yml` file in your repository. Here is what it does on every push to the `backend/` folder on `main`:
1. Checks out your code.
2. Copies the `backend` folder securely via SCP to `~/app/backend` on your EC2 instance.
3. Securely SSHs into the server to:
   *   Generate an `.env` file dynamically using your GitHub Secrets.
   *   Run `npm install --production`.
   *   Restart the Node.js server using `pm2 restart`.

*✅ Backend CI/CD is now complete! Every time you push changes to the `backend/` folder on `main`, the EC2 server updates seamlessly.*

---

## Troubleshooting & Best Practices

1. **CORS:** Ensure your `backend/server.js` uses `app.use(cors())`. If you lock it down, whitelist your exact Amplify URL: `https://main.xxxx.amplifyapp.com`.
2. **Backend Logs:** If the backend fails, SSH into the EC2 instance and run:
   ```bash
   pm2 logs antigravity-backend
   ```
3. **Nginx Reverse Proxy (Optional Upgrade):** Currently, your frontend communicates via Port 3001. In a highly secure production environment, you would install Nginx on the EC2 instance to route standard port 80/443 traffic to your PM2 process on 3001, allowing you to use SSL (https) for the backend.
