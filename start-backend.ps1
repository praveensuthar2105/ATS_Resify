# Stop any process using port 8081
$port = 8081
$processId = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($processId) {
    Write-Host "Stopping process $processId using port $port..."
    Stop-Process -Id $processId -Force
    Start-Sleep -Seconds 2
}

# Set environment variables
$env:GEMINI_API_KEY='AIzaSyA5IWrt8nN53nX_lh1jfouIH46v6ejjQtk'
$env:GOOGLE_CLIENT_ID='707889817909-fh5n50bt14ob7jn2kstqimob22getrk7.apps.googleusercontent.com'
$env:GOOGLE_CLIENT_SECRET='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'
$env:JWT_SECRET='aVeryStrongSecretKeyForJWTThatIsAtLeast256BitsLongAndSecure1234567890'
$env:DB_URL='jdbc:mysql://localhost:3306/resume_builder_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC'
$env:DB_USERNAME='root'
$env:DB_PASSWORD='1Praveen@'
$env:JAVA_HOME='C:\Program Files\Java\jdk-22'

# Change to Backend directory
Set-Location "R:\Java project\Resume_Builder\AI_Resume_Builder_Backend\Backend"

# Clean and rebuild
Write-Host "Cleaning and rebuilding project..."
mvn clean package -DskipTests

# Run the application
Write-Host "Starting Spring Boot application..."
mvn spring-boot:run
