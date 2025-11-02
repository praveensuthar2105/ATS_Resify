# 🚀 Quick Start Guide - AI Resume Builder

## Getting Started

### 1. Start the Backend (Spring Boot)

Navigate to the Backend folder and run:
```bash
cd Backend
./mvnw spring-boot:run
```

Or if using Windows:
```bash
cd Backend
mvnw.cmd spring-boot:run
```

The backend will start on `http://localhost:8080`

### 2. Start the Frontend (React + Vite)

Open a new terminal, navigate to the frontend folder and run:
```bash
cd FrontEnd/frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### 3. Access the Application

Open your browser and go to: **http://localhost:5173**

## 📝 Using the Application

### Generate Resume
1. Click on "Generate Resume" in the navigation bar
2. Describe your professional background in the text area (minimum 50 characters)
3. Click "Generate Resume" button
4. Review the AI-generated resume
5. Download as PDF

### Check ATS Score
1. Click on "ATS Score Checker" in the navigation bar
2. Upload your resume (PDF or Word format, max 5MB)
3. View your ATS score and recommendations
4. Follow the suggestions to improve your resume

## 🔧 Configuration

### Backend Port
Default: `8080`
To change: Edit `application.properties` in `Backend/src/main/resources/`

### Frontend Port
Default: `5173`
To change: Add `--port <number>` to the dev command in `package.json`

### API URL
Located in: `FrontEnd/frontend/src/services/api.js`
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

## 📱 Features Overview

✅ **Home Page** - Landing page with feature showcase
✅ **Generate Resume** - AI-powered resume creation
✅ **ATS Checker** - Analyze resume compatibility
✅ **Features** - Detailed feature list
✅ **About** - Company information

## 🛠️ Tech Stack

**Frontend:**
- React 19
- Vite
- Ant Design
- Tailwind CSS
- React Router
- Axios
- jsPDF

**Backend:**
- Spring Boot
- Java
- Gemini AI

## 📞 Support

If you encounter any issues:
1. Make sure both backend and frontend are running
2. Check that the backend is accessible at `http://localhost:8080`
3. Clear browser cache and restart the dev server
4. Check console for error messages

## 🎯 Next Steps

1. Customize the UI theme in `App.jsx`
2. Add your own branding and colors
3. Implement user authentication
4. Add resume templates
5. Implement data persistence
6. Deploy to production

Enjoy building amazing resumes! 🎉
