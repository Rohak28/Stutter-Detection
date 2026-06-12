# Docker Setup Guide - Complete Local Deployment

This guide will help you run the entire Stutter Detection application (frontend + backend) successfully on your laptop using Docker.

## 📋 Prerequisites

### Required Software
1. **Docker Desktop** (includes Docker & Docker Compose)
   - **Windows/Mac:** [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
   - **Linux:** Install Docker Engine and Docker Compose separately
     ```bash
     # Ubuntu/Debian
     sudo apt-get update
     sudo apt-get install docker.io docker-compose
     sudo usermod -aG docker $USER
     ```

2. **Verify Installation**
   ```bash
   docker --version
   docker-compose --version
   ```

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Extract the Project
```bash
unzip stutter-detection-updated.zip
cd stutter-detection-frontend
```

### Step 2: Start Docker Compose
```bash
docker-compose up -d
```

### Step 3: Wait for Services to Start
```bash
# Watch the logs (Ctrl+C to exit)
docker-compose logs -f
```

**Wait until you see:**
```
backend_1    | Running on http://0.0.0.0:10000
frontend_1   | nginx: master process started
```

### Step 4: Access the Application
- **Frontend:** http://localhost
- **Backend API:** http://localhost:10000

---

## 🔍 Verify Everything is Working

### Check Running Containers
```bash
docker-compose ps
```

**Expected Output:**
```
NAME                           STATUS
stutter-detection-backend      Up (healthy)
stutter-detection-frontend     Up (healthy)
```

### Test Backend Connection
```bash
curl http://localhost:10000/health
```

**Expected Response:**
```
healthy
```

### Test Frontend
Open http://localhost in your browser. You should see the Stutter Detection application.

---

## 🌐 How Frontend & Backend Are Connected

### Architecture
```
User Browser (http://localhost)
        ↓
   Nginx (Port 80)
        ↓
   [Frontend React App]
        ↓
   API Proxy (/api/*)
        ↓
   Backend (Port 10000)
        ↓
   [Flask API]
```

### Key Configuration Files

**1. docker-compose.yml**
- Defines both services
- Sets up networking
- Configures health checks
- Manages dependencies

**2. nginx.conf**
- Proxies `/api/*` requests to backend
- Serves frontend static files
- Handles routing for React

**3. Environment Variables**
- Frontend: `REACT_APP_API_URL=http://backend:10000`
- Backend: `FLASK_ENV=production`

---

## 📝 Common Tasks

### View Logs
```bash
# All logs
docker-compose logs -f

# Frontend only
docker-compose logs -f frontend

# Backend only
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100
```

### Stop Services
```bash
docker-compose down
```

### Restart Services
```bash
docker-compose restart
```

### Rebuild Images (after code changes)
```bash
docker-compose up -d --build
```

### Remove Everything (including volumes)
```bash
docker-compose down -v
```

### Access Container Shell
```bash
# Frontend shell
docker exec -it stutter-detection-frontend bash

# Backend shell
docker exec -it stutter-detection-backend bash
```

---

## 🐛 Troubleshooting

### Problem: "Port 80 already in use"

**Solution 1: Change ports in docker-compose.yml**
```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Changed from 80:80
  backend:
    ports:
      - "10001:10000"  # Changed from 10000:10000
```

Then access at: http://localhost:8080

**Solution 2: Kill the process using port 80**
```bash
# Find process
lsof -i :80

# Kill it (replace PID)
kill -9 <PID>
```

### Problem: "Cannot connect to backend"

**Check if backend is running:**
```bash
docker-compose logs backend
```

**Verify network connectivity:**
```bash
docker exec stutter-detection-frontend curl http://backend:10000/health
```

**Restart backend:**
```bash
docker-compose restart backend
```

### Problem: "Frontend shows blank page"

**Check browser console for errors:**
1. Open http://localhost
2. Press F12 (Developer Tools)
3. Check Console tab for errors

**Common causes:**
- Backend not running
- API URL misconfigured
- Network issues

**Solution:**
```bash
# Rebuild everything
docker-compose down -v
docker-compose up -d --build

# Wait 60 seconds for services to start
sleep 60

# Check logs
docker-compose logs
```

### Problem: "Backend crashes on startup"

**Check logs:**
```bash
docker-compose logs backend
```

**Common issues:**
- Missing dependencies
- Port conflict
- Database connection issues

**Solution:**
```bash
# Rebuild backend image
docker-compose up -d --build backend

# Wait for it to start
sleep 30

# Check if it's healthy
docker-compose ps
```

### Problem: "High memory usage"

**Increase Docker memory:**
- **Docker Desktop (Windows/Mac):** 
  - Settings → Resources → Memory (set to 4GB+)
- **Linux:** System-wide memory management

**Reduce memory usage:**
```bash
# Stop unnecessary containers
docker-compose down

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

---

## 🔧 Advanced Configuration

### Custom Ports
Edit `docker-compose.yml`:
```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Access at http://localhost:8080
  backend:
    ports:
      - "10001:10000"  # Access at http://localhost:10001
```

### Environment Variables
Edit `docker-compose.yml`:
```yaml
services:
  backend:
    environment:
      - FLASK_DEBUG=True  # Enable debug mode
      - FLASK_ENV=development
  frontend:
    environment:
      - REACT_APP_ENV=development
```

### Volume Mounts (for development)
```yaml
services:
  backend:
    volumes:
      - ./Stutter-detection-backend-main:/app  # Mount source code
```

### Network Debugging
```bash
# Inspect network
docker network inspect stutter-network

# Test DNS resolution
docker exec stutter-detection-frontend nslookup backend
```

---

## 📊 Performance Tips

### Speed Up Builds
```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker-compose up -d --build
```

### Reduce Image Size
- Frontend: ~50MB (already optimized)
- Backend: ~2.5GB (includes ML models)

### Cache Management
```bash
# Clear Docker cache
docker builder prune -a

# Rebuild without cache
docker-compose up -d --build --no-cache
```

---

## 🧪 Testing the Application

### 1. Test Language Selection
- Open http://localhost
- Go to "Analyze" page
- Select different languages (English, Hindi, Marathi)
- Verify sentences change

### 2. Test Consent Page
- Click "Start Analysis"
- Consent modal should appear
- Try submitting without checking checkbox (should show error)
- Check checkbox and submit

### 3. Test File Upload
- Upload an audio file
- Click "Start Analysis"
- Wait for processing
- View results

### 4. Test API Connectivity
```bash
# Test backend health
curl http://localhost:10000/health

# Test API endpoint
curl http://localhost:10000/api/tasks
```

---

## 📚 File Structure

```
stutter-detection-frontend/
├── docker-compose.yml          # Main Docker configuration
├── Dockerfile                  # Frontend Docker image
├── nginx.conf                  # Nginx configuration (API proxy)
├── DOCKER_SETUP_GUIDE.md       # This file
│
├── Stutter-Detection-Frontend-main/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Analyze.jsx     # Language selector added
│   │   │   ├── ConsentPage.jsx # Consent modal
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── ReadableText.jsx # Multi-language support
│   │   │   └── ...
│   │   ├── data/
│   │   │   └── sentences.json  # Multi-language sentences
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── Stutter-detection-backend-main/
│   ├── app.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── ...
```

---

## 🔐 Security Considerations

### Production Deployment
- Change default ports
- Use HTTPS/SSL certificates
- Set strong environment variables
- Implement rate limiting
- Use secrets management

### Local Development
- Keep debug mode off in production
- Don't expose sensitive data in logs
- Use `.env` files for secrets
- Validate all user inputs

---

## 📞 Support & Debugging

### Enable Debug Mode
```bash
# Edit docker-compose.yml
services:
  backend:
    environment:
      - FLASK_DEBUG=True
      - FLASK_ENV=development
```

### Collect Logs for Support
```bash
# Save all logs to file
docker-compose logs > logs.txt

# Include this when reporting issues
```

### Useful Docker Commands
```bash
# List all containers
docker ps -a

# View image details
docker images

# Inspect container
docker inspect stutter-detection-backend

# View resource usage
docker stats

# Clean up everything
docker system prune -a
```

---

## ✅ Deployment Checklist

- [ ] Docker Desktop installed and running
- [ ] Project extracted to local folder
- [ ] `docker-compose up -d` executed
- [ ] Both services show "healthy" in `docker-compose ps`
- [ ] Frontend accessible at http://localhost
- [ ] Backend accessible at http://localhost:10000/health
- [ ] Language selector works (English, Hindi, Marathi)
- [ ] Consent page appears when clicking "Start Analysis"
- [ ] Can upload audio file and submit
- [ ] Results display correctly
- [ ] No errors in browser console (F12)
- [ ] No errors in Docker logs

---

## 🎯 Next Steps

1. **Test the application thoroughly**
   - Try all languages
   - Upload test audio files
   - Check results display

2. **Customize as needed**
   - Modify sentences in `sentences.json`
   - Adjust port numbers
   - Configure environment variables

3. **Deploy to production**
   - Use cloud services (AWS, GCP, Azure)
   - Set up CI/CD pipeline
   - Configure SSL/HTTPS
   - Implement monitoring

---

## 📖 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [React Documentation](https://react.dev/)
- [Flask Documentation](https://flask.palletsprojects.com/)

---

**Version:** 2.1.0 (with Multi-language Support)
**Last Updated:** January 3, 2025
**Status:** Ready for Production
