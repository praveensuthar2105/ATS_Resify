# ATS Resify - AI Resume Builder

I built this project to take the headache out of making resumes that actually pass through Applicant Tracking Systems (ATS). Instead of fighting with MS Word formatting, you just describe your experience in plain English, and the app uses AI to generate a professional, LaTeX-based resume for you.

## Why I made this
Most people struggle with two things:
1. Writing bullet points that sound professional and "quantified".
2. Getting the formatting right so an ATS can actually read it.

ATS Resify handles both by using Gemini to write the content and LaTeX to ensure the structure is rock-solid.

## Key Features
- **AI Content Generation**: I integrated the Gemini 2.0 Flash API to turn "I worked on a website" into "Engineered a high-performance web application using React..."
- **LaTeX Templates**: It comes with 4 different styles (Modern, Creative, etc.). The backend compiles the LaTeX code directly into a high-quality PDF using MiKTeX.
- **ATS Scoring**: I used Apache PDFBox to parse the generated PDF and give you a score based on how well it matches common job requirements.
- **Google Login**: Secure sign-in with Google OAuth2 and JWTs to keep everything stateless and fast.

## Tech Stack
- **Backend**: Java 21 with Spring Boot 3.3.5.
- **Database**: MySQL 8.0 (using Hibernate/JPA).
- **PDF Engine**: MiKTeX/pdfLaTeX (you'll need this installed on your machine).
- **AI**: Google Gemini API via Spring's RestClient.
- **Frontend**: React 18 with Ant Design for the UI and Tailwind for styling.

## Getting it running

### Prerequisites
- Java 21
- Node.js (I used 18+)
- MySQL
- MiKTeX (The app calls `pdflatex` directly, so make sure it's in your PATH)
- A Gemini API Key

### Backend
1. Go into the `Backend` folder.
2. Copy `application-example.properties` to `application.properties` and fill in your DB credentials, Gemini key, and Google OAuth info.
3. Run it with `./mvnw spring-boot:run`. It starts on port 8081.

### Frontend
1. Go into `FrontEnd/frontend`.
2. Run `npm install`.
3. Start the dev server with `npm run dev`. It'll be at `http://localhost:5173`.

## A few notes
- The prompt engineering is key here—I spent a lot of time tweaking how Gemini generates the LaTeX to make sure it doesn't break the compilation.
- If you're on Windows, make sure MiKTeX is set to "install missing packages on the fly" otherwise the first PDF generation might fail.

---
*Developed by [Praveen Suthar](https://github.com/praveensuthar2105)*
