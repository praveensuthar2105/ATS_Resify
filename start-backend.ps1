# Stop any process using port 8081
$port = 8081
$processId = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($processId) {
    Write-Host "Stopping process $processId using port $port..."
    Stop-Process -Id $processId -Force
    Start-Sleep -Seconds 2
}

# Set environment variables (use your own values or set them in your environment)
# IMPORTANT: Do NOT commit real secrets to version control.
# Set these in your system environment or create a .env file that is gitignored.
if (-not $env:GEMINI_API_KEY) { Write-Host "WARNING: GEMINI_API_KEY not set. Set it in your environment." -ForegroundColor Yellow }
if (-not $env:GOOGLE_CLIENT_ID) { Write-Host "WARNING: GOOGLE_CLIENT_ID not set. Set it in your environment." -ForegroundColor Yellow }
if (-not $env:GOOGLE_CLIENT_SECRET) { Write-Host "WARNING: GOOGLE_CLIENT_SECRET not set. Set it in your environment." -ForegroundColor Yellow }
if (-not $env:JWT_SECRET) {
    Write-Host "" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "WARNING: JWT_SECRET is not set!" -ForegroundColor Red
    Write-Host "A secure JWT secret (256+ bits) is required for production." -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    $confirm = Read-Host "Continue with DEV PLACEHOLDER secret? (y/N)"
    if ($confirm -ne 'y' -and $confirm -ne 'Y') {
        Write-Host "Aborted. Set JWT_SECRET in your environment and try again." -ForegroundColor Yellow
        exit 1
    }
    $env:JWT_SECRET='DEV_PLACEHOLDER_NOT_FOR_PRODUCTION_USE'
    Write-Host "Using dev placeholder. DO NOT use in production!" -ForegroundColor Yellow
}
if (-not $env:DB_URL) { $env:DB_URL='jdbc:mysql://localhost:3306/resume_builder_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true' }
if (-not $env:DB_USERNAME) { $env:DB_USERNAME='root' }
if (-not $env:DB_PASSWORD) { Write-Host "WARNING: DB_PASSWORD not set. Set it in your environment." -ForegroundColor Yellow }
if (-not $env:JAVA_HOME) { $env:JAVA_HOME='C:\Program Files\Java\jdk-22' }

# Change to Backend directory
Set-Location "R:\Java project\Resume_Builder\AI_Resume_Builder_Backend\Backend"

# Clean and rebuild
Write-Host "Cleaning and rebuilding project..."
mvn clean package -DskipTests

# Run the application
Write-Host "Starting Spring Boot application..."
mvn spring-boot:run
