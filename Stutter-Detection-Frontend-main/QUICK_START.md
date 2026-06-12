# 🎯 StutterSense - Quick Start Guide

## Prerequisites

Before running StutterSense, make sure you have the following installed:

| Requirement | Version | Download Link |
|-------------|---------|---------------|
| **Docker Desktop** | Latest | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |

> [!IMPORTANT]
> Docker Desktop must be **running** before you start the application.

---

## 🚀 Quick Start (Recommended)

### Option 1: One-Click Start (Windows)

1. **Double-click** the `START_APP.bat` file in the project folder
2. Wait for Docker to build and start (first time takes ~5 minutes)
3. Open your browser to **http://localhost**

To stop the application, double-click `STOP_APP.bat`.

---

### Option 2: Command Line

Open a terminal in the project directory and run:

```bash
# Navigate to the project folder
cd "d:\SD\Rajlakshmi\stutter-detection-app_enhanced-final(2)\SD A E F"

# Start the application
docker-compose up -d

# View logs (optional)
docker-compose logs -f
```

**To stop:**
```bash
docker-compose down
```

---

## 📁 Project Structure

```
SD A E F/
├── Stutter-Detection-Frontend-main/    # React Frontend
│   ├── src/
│   │   ├── pages/                      # Page components
│   │   │   ├── Home.jsx               # Landing page
│   │   │   ├── Login.jsx              # User login
│   │   │   ├── Signup.jsx             # User registration
│   │   │   ├── Dashboard.jsx          # User dashboard
│   │   │   ├── Analyze.jsx            # Speech recording
│   │   │   └── Results.jsx            # Analysis results
│   │   ├── components/                 # Reusable components
│   │   └── contexts/                   # React contexts
│   └── Dockerfile
│
├── Stutter-detection-backend-main/     # Flask Backend
│   ├── app.py                          # Main API server
│   ├── analyzer.py                     # Speech analysis
│   └── Dockerfile
│
├── docker-compose.yml                  # Docker configuration
├── START_APP.bat                       # Windows start script
└── STOP_APP.bat                        # Windows stop script
```

---

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost | Main application |
| **Backend API** | http://localhost:10000 | REST API |
| **Health Check** | http://localhost:10000/health | API status |

---

## 👤 User Accounts

### Create a New Account
1. Go to http://localhost/signup
2. Choose account type: **Patient** or **Therapist (SLP)**
3. Fill in your details
4. Click "Create Account"

### Account Types

| Type | Description | Features |
|------|-------------|----------|
| **Patient** | Speech therapy client | Record speech, view results, track progress |
| **Therapist (SLP)** | Speech-Language Pathologist | Manage patients, review analyses, provide feedback |

---

## 🎮 Features Guide

### 1. Dashboard
- View your statistics and progress
- Unlock achievement badges
- See recent analyses

### 2. Analyze Page
- Record video/audio of your speech
- Upload existing recordings
- Select sentences to read
- Choose your therapist (SLP)

### 3. Results Page
- View fluency score (animated circle)
- See disfluency breakdown charts
- Review individual stuttering events
- Download reports

### 4. Dark Mode
- Click the 🌙/☀️ icon in the header
- Preference is saved automatically

---

## 🛠️ Development Mode

If you want to run the project without Docker for development:

### Frontend (React)
```bash
cd Stutter-Detection-Frontend-main
npm install
npm run dev
```
Access at: http://localhost:5173

### Backend (Flask)
```bash
cd Stutter-detection-backend-main
pip install -r requirements.txt
python app.py
```
Access at: http://localhost:10000

---

## 🔧 Troubleshooting

### Docker Issues

**Problem:** "Cannot connect to Docker daemon"
```bash
# Solution: Make sure Docker Desktop is running
# On Windows: Open Docker Desktop from Start Menu
```

**Problem:** Port 80 already in use
```bash
# Solution: Stop the conflicting service or change the port
docker-compose down
# Edit docker-compose.yml and change "80:80" to "3000:80"
docker-compose up -d
# Access at http://localhost:3000
```

### Application Issues

**Problem:** Page shows blank/error
```bash
# Solution: Rebuild the containers
docker-compose down
docker-compose up -d --build
```

**Problem:** API not responding
```bash
# Check backend logs
docker-compose logs backend
```

---

## 📱 Browser Support

| Browser | Status |
|---------|--------|
| Chrome | ✅ Recommended |
| Firefox | ✅ Supported |
| Edge | ✅ Supported |
| Safari | ✅ Supported |

> [!NOTE]
> For video recording features, you need to grant camera and microphone permissions.

---

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | User login |
| POST | `/api/signup` | User registration |

### Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload_audio/<task_id>` | Upload recording |
| GET | `/api/task_status/<task_id>` | Check analysis status |
| GET | `/api/get_result/<task_id>` | Get analysis results |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/<user_id>` | Get dashboard data |
| GET | `/api/progress/<user_id>` | Get progress history |
| GET | `/api/stats/<user_id>` | Get quick stats |
| GET | `/api/leaderboard` | Get top performers |

---

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review Docker logs: `docker-compose logs`
3. Restart the application: `docker-compose restart`

---

Made with ❤️ by the StutterSense Team
