# AI Resume Builder

**Repository**: [GitHub - Ai_Resume_Builder](https://github.com/praveensuthar2105/Ai_Resume_Builder)  
**Technologies**: Java 21, Spring Boot 3.3.5, Spring RestClient, React 18, MySQL 8.0, Google Gemini 2.0 Flash API

## 📋 Project Description

- **Developed an AI-powered resume builder** using Spring Boot 3.3.5 and React 18, integrating Google Gemini 2.0 Flash API via Spring RestClient to transform user descriptions into professional LaTeX code, automatically compiling to PDF with MiKTeX/pdfLaTeX across 4 ATS-optimized templates (Modern, Professional, Creative, ATS-Focused).
- **Engineered robust backend services** including custom prompt template engine for AI content generation, JSON response parsing with Jackson, PDF text extraction using Apache PDFBox for ATS score analysis, and automated LaTeX compilation pipeline with configurable timeout and error handling for production reliability.
- **Implemented secure authentication and authorization** with Spring Security, Google OAuth2 login integration, JWT token-based stateless sessions, user role management (USER/ADMIN), and MySQL 8.0 persistence layer using Spring Data JPA and Hibernate ORM with HikariCP connection pooling.

## 🚀 Features

- **AI-Powered Resume Generation**: Generate professional resumes using Gemini LLM API based on user descriptions
- **Multiple Resume Templates**: Choose from professional, modern, creative, and ATS-optimized templates
- **ATS Score Checker**: Analyze resume compatibility with Applicant Tracking Systems
- **LaTeX PDF Generation**: High-quality PDF output using LaTeX templates
- **Secure Authentication**: Google OAuth2 integration with JWT tokens
- **RESTful API**: Well-structured backend APIs for seamless integration

## 🛠️ Tech Stack

### Backend
- **Java 21** - Programming language
- **Spring Boot 3.3.5** - Application framework
- **Spring Security** - Authentication and authorization
- **Spring RestClient** - HTTP client for Gemini API integration
- **Maven** - Build and dependency management
- **MySQL 8.0** - Database
- **JWT** - Token-based authentication
- **Apache PDFBox** - PDF manipulation
- **MiKTeX/pdfLaTeX** - LaTeX to PDF compilation

### Frontend
- **React 18** - UI framework
- **Ant Design** - Component library
- **Tailwind CSS** - Styling
- **Vite** - Build tool

### AI Integration
- **Google Gemini API** (gemini-2.0-flash) - Large Language Model for content generation

## 📁 Project Structure

```
AI_Resume_Builder_Backend/
├── Backend/                 # Spring Boot backend application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/Backend/AI_Resume_Builder_Backend/
│   │   │   │   ├── Configuration/    # Security and app configuration
│   │   │   │   ├── Controller/       # REST API endpoints
│   │   │   │   ├── Entity/           # JPA entities
│   │   │   │   ├── Repository/       # Data access layer
│   │   │   │   ├── Security/         # JWT and security components
│   │   │   │   └── Service/          # Business logic
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       ├── latex_templates/  # LaTeX resume templates
│   │   │       └── prompts/          # AI prompt templates
│   │   └── test/
│   └── pom.xml
├── FrontEnd/               # React frontend application
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── services/
│       │   └── utils/
│       └── package.json
└── QUICKSTART.md          # Quick start guide
```

## 🚀 Getting Started

### Prerequisites
- Java 21 or higher
- Maven 3.8+
- Node.js 18+ and npm
- MySQL 8.0+
- MiKTeX (for PDF generation)
- Google Gemini API key

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/praveensuthar2105/Ai_Resume_Builder.git
   cd AI_Resume_Builder_Backend/Backend
   ```

2. **Configure application properties**
   ```bash
   cp src/main/resources/application-example.properties src/main/resources/application.properties
   ```
   
   Update the following in `application.properties`:
   - Database credentials
   - Gemini API key
   - Google OAuth2 credentials
   - JWT secret

3. **Run the application**
   ```bash
   ./mvnw spring-boot:run
   ```
   
   Backend will start on `http://localhost:8081`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd FrontEnd/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   
   Frontend will start on `http://localhost:5173`

## 🔑 Key Features Implementation

### Gemini API Integration
- Direct RESTful API calls using Spring's RestClient
- Structured JSON request/response handling
- Robust error handling and retry mechanisms

### JSON Parsing & Prompt Templating
- Custom prompt templates for resume generation and ATS analysis
- Structured JSON parsing for AI responses
- Template-based content generation

### Security
- Google OAuth2 authentication
- JWT token-based authorization
- Secure API endpoints with Spring Security

### Resume Generation Pipeline
1. User provides description and selects template
2. Backend processes request with Gemini API
3. AI generates structured resume content
4. LaTeX template renders content to PDF
5. PDF delivered to user

## 📚 API Documentation

Key endpoints:
- `POST /api/auth/google` - Google OAuth authentication
- `POST /api/resume/generate` - Generate resume from description
- `POST /api/ats/check` - Check ATS compatibility score
- `GET /api/resume/download/{id}` - Download generated resume

## 🤝 Contributing

This is a student project for learning purposes. Contributions, issues, and feature requests are welcome!

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Praveen Suthar**
- GitHub: [@praveensuthar2105](https://github.com/praveensuthar2105)

## 🙏 Acknowledgments

- Google Gemini API for AI capabilities
- Spring Boot community
- React and Ant Design teams
- LaTeX and MiKTeX projects
