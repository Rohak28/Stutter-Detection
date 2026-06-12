# Stutter Detection - Complete Application

A comprehensive AI-powered stutter detection system with an interactive React frontend and Python Flask backend. This application analyzes audio and video recordings to identify stuttering patterns and provide detailed analysis reports.

## 🎯 New Features

### ✅ Patient Consent Page
- **Mandatory T&C Agreement**: Users must explicitly consent to audio/video recording before analysis
- **Smooth Animations**: Modal dialog with fade-in/scale animations
- **Clear Terms**: Detailed information about data collection, privacy, and voluntary participation
- **Validation**: Prevents analysis from starting until consent is given

### ✅ Enhanced Results Dashboard
- **Interactive Visualizations**: Charts and graphs showing disfluency patterns
- **Smooth Animations**: Staggered fade-in animations with hover effects
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Detailed Metrics**: Fluency score, severity classification, and event timeline
- **Actionable Insights**: Personalized recommendations based on analysis results

### ✅ Improved Animations & Transitions
- **Page Transitions**: Smooth fade-in/fade-out effects
- **Component Animations**: Staggered animations for sequential element appearance
- **Hover Effects**: Interactive hover states on cards and buttons
- **Loading States**: Animated loading indicators during analysis
- **Framer Motion Integration**: Professional motion effects throughout the app

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Docker Setup](#docker-setup)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Frontend
- **User Interface**: Clean, responsive UI with Tailwind CSS
- **Real-time Recording**: Record audio and video directly from the browser
- **File Upload**: Upload pre-recorded audio/video files
- **Results Visualization**: Interactive charts and detailed analysis reports
- **User Authentication**: Login/signup with role-based access (Patient/SLP)
- **Guided Tour**: Interactive tutorial for first-time users
- **Dark Mode Support**: Theme switching capability

### Backend
- **Audio Processing**: Advanced audio feature extraction
- **Stutter Detection**: AI-powered detection of stuttering patterns
- **Transcription**: Speech-to-text transcription
- **Visualization**: Spectrogram and waveform generation
- **API Server**: RESTful API for frontend communication
- **Task Management**: Track analysis tasks and results

## 🛠️ Tech Stack

### Frontend
- **React 18.2**: UI library
- **Vite 4.4**: Build tool and dev server
- **Tailwind CSS 3.3**: Utility-first CSS framework
- **Framer Motion 10.12**: Animation library
- **Recharts 2.7**: Data visualization
- **React Router 6.14**: Client-side routing
- **Shadcn/ui**: Reusable UI components
- **Lucide React 0.263**: Icon library

### Backend
- **Python 3.11**: Programming language
- **Flask 2.3**: Web framework
- **Gunicorn**: WSGI server
- **FFmpeg**: Audio/video processing
- **NLTK**: Natural language processing
- **spaCy**: NLP library
- **librosa**: Audio analysis
- **NumPy/SciPy**: Scientific computing

## 📁 Project Structure

```
stutter-detection/
├── Stutter-Detection-Frontend-main/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Analyze.jsx
│   │   │   ├── ConsentPage.jsx (NEW)
│   │   │   ├── Results.jsx (ENHANCED)
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── Documentation.jsx
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── AnimatedBackground.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ui/ (Shadcn components)
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── Dockerfile
│   ├── docker-compose.yml (NEW)
│   ├── DOCKER_README.md (NEW)
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── README.md
│
├── Stutter-detection-backend-main/
│   ├── src/
│   │   ├── audio/
│   │   │   ├── audio_config.py
│   │   │   ├── audio_recorder.py
│   │   │   ├── feature_extractor.py
│   │   │   ├── processor.py
│   │   │   ├── stutter_detector.py
│   │   │   └── transcription_analyzer.py
│   │   ├── utils/
│   │   │   └── audio_utils.py
│   │   └── visualization/
│   │       └── speech_visualizer.py
│   ├── tests/
│   ├── Dockerfile
│   ├── app.py
│   ├── requirements.txt
│   └── README.md
```

## 🚀 Installation

### Prerequisites

- **Node.js**: v18 or higher
- **Python**: 3.11 or higher
- **FFmpeg**: For audio processing
- **Docker & Docker Compose**: For containerized deployment

### Local Development Setup

#### Frontend

```bash
cd Stutter-Detection-Frontend-main
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

#### Backend

```bash
cd Stutter-detection-backend-main
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The backend will be available at `http://localhost:10000`

## 🐳 Docker Setup

### Quick Start with Docker Compose

The easiest way to run the entire application is with Docker Compose:

```bash
# Navigate to the project root
cd stutter-detection

# Start both frontend and backend
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

**Access the Application:**
- Frontend: http://localhost
- Backend API: http://localhost:10000

### Building Individual Docker Images

#### Frontend

```bash
cd Stutter-Detection-Frontend-main
docker build -t stutter-frontend:latest .
docker run -p 80:80 stutter-frontend:latest
```

#### Backend

```bash
cd Stutter-detection-backend-main
docker build -t stutter-backend:latest .
docker run -p 10000:10000 stutter-backend:latest
```

### Docker Image Specifications

**Frontend:**
- Base Image: `node:18-alpine` → `nginx:alpine`
- Size: ~50MB
- Port: 80 (HTTP)
- Build Strategy: Multi-stage (build + serve)

**Backend:**
- Base Image: `python:3.11-slim`
- Size: ~2.5GB (includes ML models)
- Port: 10000
- Server: Gunicorn WSGI

### Environment Variables

Create `.env` files for configuration:

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:10000
REACT_APP_ENV=production
```

**Backend (.env)**
```env
FLASK_ENV=production
FLASK_DEBUG=False
PYTHONUNBUFFERED=1
```

### Troubleshooting Docker

**Port Already in Use:**
```bash
# Change ports in docker-compose.yml
# Or kill the process using the port
lsof -i :80
kill -9 <PID>
```

**Container Exits Immediately:**
```bash
docker logs <container-name>
```

**Memory Issues:**
- Increase Docker's memory allocation in Docker Desktop settings
- Linux: Adjust system memory limits

For detailed Docker documentation, see [DOCKER_README.md](./DOCKER_README.md)

## 📖 Usage

### For Patients

1. **Sign Up**: Create an account with your details
2. **Analyze**: Navigate to the Analyze page
3. **Consent**: Review and accept the privacy agreement
4. **Record/Upload**: Record audio/video or upload a file
5. **Submit**: Click "Start Analysis" to begin processing
6. **Results**: View detailed analysis results with recommendations

### For Speech-Language Pathologists (SLPs)

1. **Login**: Use your SLP credentials
2. **View Tasks**: See all completed patient analyses
3. **Review Results**: Examine detailed analysis reports
4. **Provide Feedback**: Add notes and recommendations

## 🔌 API Endpoints

### Authentication
- `POST /api/signup` - Register new user
- `POST /api/login` - User login
- `POST /api/logout` - User logout

### Analysis
- `POST /api/verify_user` - Verify user details
- `POST /api/upload_audio/<task_id>` - Upload audio for analysis
- `GET /api/task_status/<task_id>` - Get analysis status
- `GET /api/get_result/<task_id>` - Get analysis results

### Tasks (SLP Only)
- `GET /api/tasks` - Get all completed tasks
- `GET /api/user_name/<user_id>` - Get user name

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For issues, questions, or suggestions:

1. Check the [DOCKER_README.md](./DOCKER_README.md) for Docker-related help
2. Review existing GitHub issues
3. Create a new issue with detailed information
4. Contact the development team

---

**Version:** 2.0.0 (with Consent Page & Enhanced Results)
**Last Updated:** December 2024
**Maintainers:** Stutter Detection Team
