# 🎯 Stutter Detection Application

**A complete speech analysis platform with multi-language support, user authentication, and AI-powered stutter detection.**

---

## ✨ Features

### 🔐 Authentication
- ✅ User Sign Up (Patient & SLP)
- ✅ Secure Login with password hashing
- ✅ Session management
- ✅ Role-based access control

### 🌐 Multi-Language Support
- ✅ English
- ✅ हिंदी (Hindi)
- ✅ मराठी (Marathi)
- ✅ 10 sentences per language per grade level

### 🎤 Speech Analysis
- ✅ Audio file upload
- ✅ Video recording
- ✅ Real-time analysis
- ✅ Detailed results with metrics

### 📊 Results Dashboard
- ✅ Interactive charts
- ✅ Fluency metrics
- ✅ Disfluency analysis
- ✅ Downloadable reports

### 🎨 User Interface
- ✅ Responsive design
- ✅ Smooth animations
- ✅ Consent page for data privacy
- ✅ Professional UI components

---

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))

### Installation & Running

```bash
# 1. Extract the project
unzip stutter-detection-app-final.zip
cd stutter-detection-app

# 2. Start the application
docker-compose up -d

# 3. Open in browser
# http://localhost
```

**That's it! The app is running!** ✅

---

## 📁 Project Structure

```
stutter-detection-app/
├── START_HERE.md                      ← Read this first!
├── DOCKER_BEGINNER_GUIDE.md           ← Docker tutorial
├── docker-compose.yml                 ← Docker configuration
├── nginx.conf                         ← Web server config
├── Dockerfile.frontend                ← Frontend build
│
├── Stutter-Detection-Frontend-main/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx              ← Login page (FIXED)
│   │   │   ├── Signup.jsx             ← Signup page (FIXED)
│   │   │   ├── Analyze.jsx            ← Analysis page
│   │   │   ├── Results.jsx            ← Results page
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── ReadableText.jsx       ← Multi-language sentences
│   │   │   ├── PrivateRoute.jsx       ← Route protection
│   │   │   └── ...
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx        ← Authentication (FIXED)
│   │   ├── data/
│   │   │   └── sentences.json         ← Multi-language data
│   │   └── ...
│   ├── package.json
│   └── Dockerfile
│
├── Stutter-detection-backend-main/
│   ├── app.py                         ← Main server
│   ├── analyzer.py                    ← Speech analysis
│   ├── requirements.txt                ← Dependencies
│   └── Dockerfile
```

---

## 🔧 What Was Fixed

### ✅ Authentication Issues
- Fixed AuthContext to properly handle API calls
- Updated Login.jsx to use AuthContext methods
- Updated Signup.jsx to use AuthContext methods
- Added proper error handling and validation

### ✅ Backend-Frontend Linking
- Configured Nginx API proxy
- Set up Docker networking
- Added health checks
- Proper service dependencies

### ✅ Multi-Language Support
- Added language selector to Analyze page
- 10 simple sentences per language
- Language-specific UI labels
- Progress indicator for sentences

### ✅ Project Structure
- Organized into proper folders
- Frontend: `Stutter-Detection-Frontend-main`
- Backend: `Stutter-detection-backend-main`
- Docker files at root level

---

## 🧪 Testing the Application

### 1. Sign Up
```
1. Click "Sign Up"
2. Fill in: Name, Email, Password
3. Choose "Patient" or "SLP"
4. Click "Sign Up"
```

### 2. Login
```
1. Click "Login"
2. Enter email and password
3. Choose same user type
4. Click "Sign In"
```

### 3. Use Analysis
```
1. Go to "Analyze"
2. Select Language (English/Hindi/Marathi)
3. Select Grade Level
4. Record or upload audio
5. Click "Start Analysis"
6. Accept consent terms
7. View results
```

---

## 🐳 Docker Commands

### Start Application
```bash
docker-compose up -d
```

### Stop Application
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f
```

### Restart Services
```bash
docker-compose restart
```

### Rebuild After Changes
```bash
docker-compose up -d --build
```

### Check Status
```bash
docker-compose ps
```

---

## 🐛 Troubleshooting

### Port Already in Use
Edit `docker-compose.yml` and change `80:80` to `8080:80`

### Services Not Starting
```bash
docker-compose down -v
docker-compose up -d --build
```

### Login/Signup Not Working
```bash
docker-compose logs backend
docker-compose restart backend
```

### Blank Page
- Press F12 to open DevTools
- Check Console for errors
- Verify backend is running: `docker-compose ps`

---

## 📚 Documentation

- **START_HERE.md** - Quick 3-minute setup
- **DOCKER_BEGINNER_GUIDE.md** - Comprehensive Docker tutorial
- **Original Frontend README** - In Stutter-Detection-Frontend-main/
- **Original Backend README** - In Stutter-detection-backend-main/

---

## 🔐 Security

### Implemented
- ✅ Password hashing with bcrypt
- ✅ API proxy through Nginx
- ✅ CORS configuration
- ✅ Input validation
- ✅ Error handling

### Recommended for Production
- 🔒 HTTPS/SSL certificates
- 🔒 Environment variables for secrets
- 🔒 Rate limiting
- 🔒 Database backups
- 🔒 Monitoring & logging

---

## 🌐 Accessing the Application

| Component | URL |
|-----------|-----|
| Frontend | http://localhost |
| Backend API | http://localhost:10000 |
| Backend Health | http://localhost:10000/health |

---

## 📊 Technology Stack

### Frontend
- React 19
- React Router
- Framer Motion (animations)
- Tailwind CSS
- shadcn/ui components

### Backend
- Flask (Python)
- MongoDB
- PyAudio
- FFmpeg
- ML Models for analysis

### DevOps
- Docker
- Docker Compose
- Nginx
- Multi-stage builds

---

## 🎯 User Flows

### Patient Flow
```
1. Sign Up → 2. Login → 3. Select Language → 4. Record/Upload Audio
→ 5. Accept Consent → 6. Submit Analysis → 7. View Results
```

### SLP Flow
```
1. Sign Up as SLP → 2. Login → 3. View Patient Tasks
→ 4. Review Analysis Results → 5. Provide Feedback
```

---

## 📈 Features Explained

### Multi-Language Support
- Sentences change based on selected language
- Grade-level appropriate content
- Smooth language switching
- Progress indicator

### Consent Page
- Appears before analysis starts
- Mandatory checkbox agreement
- Clear terms about data collection
- Cannot proceed without consent

### Results Dashboard
- Interactive charts
- Fluency score
- Disfluency breakdown
- Downloadable reports
- Smooth animations

---

## 🚀 Deployment

### Local Development
```bash
docker-compose up -d
```

### Production Deployment
1. Set up SSL/HTTPS
2. Configure environment variables
3. Use production database
4. Enable monitoring
5. Set up backups
6. Configure rate limiting

---

## 💡 Tips & Tricks

### View Real-Time Logs
```bash
docker-compose logs -f backend
```

### Access Container Shell
```bash
docker exec -it stutter-detection-backend bash
```

### Check Resource Usage
```bash
docker stats
```

### Clean Up Everything
```bash
docker-compose down -v
docker image prune -a
```

---

## 🤝 Support

### First Steps
1. Read `START_HERE.md`
2. Read `DOCKER_BEGINNER_GUIDE.md`
3. Check logs: `docker-compose logs -f`

### Common Issues
- **Port in use:** Change port in docker-compose.yml
- **Services won't start:** Check logs and restart
- **Login fails:** Verify backend is running
- **Blank page:** Check browser console (F12)

---

## 📝 Version History

### v2.1.0 (Current)
- ✅ Fixed login/signup authentication
- ✅ Multi-language support (English, Hindi, Marathi)
- ✅ Proper Docker backend-frontend linking
- ✅ Consent page with mandatory agreement
- ✅ Comprehensive documentation
- ✅ Beginner-friendly Docker guide

### v2.0.0
- Added consent page
- Enhanced animations
- Docker support

### v1.0.0
- Initial release
- Basic analysis functionality

---

## 📞 Getting Help

### Check These First
1. `START_HERE.md` - Quick setup
2. `DOCKER_BEGINNER_GUIDE.md` - Docker help
3. Logs: `docker-compose logs -f`

### Common Solutions
- Restart: `docker-compose restart`
- Reset: `docker-compose down -v && docker-compose up -d --build`
- Check status: `docker-compose ps`

---

## ✅ Deployment Checklist

- [ ] Docker Desktop installed
- [ ] Project extracted
- [ ] `docker-compose up -d` executed
- [ ] Both services show "healthy"
- [ ] Frontend accessible at http://localhost
- [ ] Backend accessible at http://localhost:10000
- [ ] Can sign up and login
- [ ] Can select language
- [ ] Can upload audio
- [ ] Can view results

---

## 🎉 You're Ready!

Everything is set up and ready to use. Just run:

```bash
docker-compose up -d
```

And open: **http://localhost**

**Enjoy! 🚀**

---

**Version:** 2.1.0
**Last Updated:** March 10, 2025
**Status:** Production Ready
