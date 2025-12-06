# AI Resume Builder - Frontend

**Java 21 • Spring Boot 3.3.5 • Spring RestClient • React 18 • Google Gemini 2.0 Flash • MySQL 8.0**

## 📋 Project Description

- **Developed an AI-powered resume builder** using Spring Boot 3.3.5 and React 18, integrating Google Gemini 2.0 Flash API via Spring RestClient to transform user descriptions into professional LaTeX code, automatically compiling to PDF with MiKTeX/pdfLaTeX across 4 ATS-optimized templates (Modern, Professional, Creative, ATS-Focused).
- **Engineered robust backend services** including custom prompt template engine for AI content generation, JSON response parsing with Jackson, PDF text extraction using Apache PDFBox for ATS score analysis, and automated LaTeX compilation pipeline with configurable timeout and error handling for production reliability.
- **Implemented secure authentication and authorization** with Spring Security, Google OAuth2 login integration, JWT token-based stateless sessions, user role management (USER/ADMIN), and MySQL 8.0 persistence layer using Spring Data JPA and Hibernate ORM with HikariCP connection pooling.

## 🚀 Features

- **AI-Powered Resume Generation**: Generate professional resumes using AI based on your description
- **ATS Score Checker**: Upload your resume to check its compatibility with Applicant Tracking Systems
- **Modern UI/UX**: Beautiful interface built with Ant Design and Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **PDF Export**: Download your generated resume as a PDF
- **Real-time Preview**: See your resume as you create it

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on `http://localhost:8080`

## 🛠️ Installation

1. Navigate to the frontend directory:
```bash
cd FrontEnd/frontend
```

2. Install dependencies:
```bash
npm install
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

The application will start on `http://localhost:5173` (or another port if 5173 is busy).

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/         # Reusable components
│   │   ├── Navbar.jsx     # Navigation bar
│   │   └── Footer.jsx     # Footer component
│   ├── pages/             # Page components
│   │   ├── Home.jsx       # Landing page
│   │   ├── GenerateResume.jsx  # Resume generation page
│   │   ├── AtsChecker.jsx      # ATS score checker page
│   │   ├── Features.jsx        # Features page
│   │   └── About.jsx           # About page
│   ├── services/          # API services
│   │   └── api.js         # API client and endpoints
│   ├── App.jsx            # Main app component
│   ├── App.css            # App styles
│   ├── index.css          # Global styles
│   └── main.jsx           # Entry point
├── public/                # Static files
├── index.html             # HTML template
├── package.json           # Dependencies
├── tailwind.config.js     # Tailwind configuration
├── postcss.config.js      # PostCSS configuration
└── vite.config.js         # Vite configuration
```

## 🔌 API Endpoints

The frontend connects to these backend endpoints:

- `POST /api/resume/generate` - Generate resume from description
- `POST /api/resume/ats-score` - Calculate ATS score from uploaded file

Make sure your backend is running on `http://localhost:8080` before starting the frontend.

## 🎨 Technologies Used

- **React 19** - UI library
- **Vite** - Build tool
- **Ant Design** - UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **jsPDF** - PDF generation

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
