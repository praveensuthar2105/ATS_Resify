# PowerShell script to run Ats Resify Microservices locally

# 1. Stop any processes using the microservice ports
$ports = @(8761, 8080, 8081, 8082, 8083)
Write-Host "Checking for port conflicts..." -ForegroundColor Cyan
foreach ($port in $ports) {
    $processId = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    if ($processId) {
        Write-Host "Stopping process $processId using port $port..." -ForegroundColor Yellow
        Stop-Process -Id $processId -Force
        Start-Sleep -Seconds 1
    }
}

# 2. Load .env file environment variables
$envFile = Join-Path (Get-Location) ".env"
if (Test-Path $envFile) {
    Write-Host "Loading environment variables from .env file..." -ForegroundColor Cyan
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $key, $value = $line.Split("=", 2)
            $key = $key.Trim()
            $value = $value.Trim()
            [System.Environment]::SetEnvironmentVariable($key, $value)
        }
    }
}

# 3. Environment variables validation & defaults
if (-not $env:GEMINI_API_KEY) { Write-Host "WARNING: GEMINI_API_KEY not set. Set it in your environment." -ForegroundColor Yellow }
if (-not $env:GOOGLE_CLIENT_ID) { Write-Host "WARNING: GOOGLE_CLIENT_ID not set. OAuth2 redirects will fail." -ForegroundColor Yellow }
if (-not $env:GOOGLE_CLIENT_SECRET) { Write-Host "WARNING: GOOGLE_CLIENT_SECRET not set. OAuth2 authentication will fail." -ForegroundColor Yellow }
if (-not $env:JWT_SECRET) {
    $env:JWT_SECRET='d3f4u1t_jW1_53cr3t_v4lU3_f0r_L0c4l_D3v3l0pm3nt_0nly!'
    Write-Host "JWT_SECRET was not set. Using dev placeholder secret." -ForegroundColor Yellow
}
if (-not $env:DB_URL) {
    $env:DB_URL='jdbc:mysql://localhost:3306/resume_builder_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true'
}
if (-not $env:DB_USERNAME) { $env:DB_USERNAME='root' }

# Configure Java to allow IPv6/dual-stack connectivity
$env:JAVA_TOOL_OPTIONS = "-Djava.net.preferIPv4Stack=false"

# 4. Change directory and build project
$backendDir = Join-Path (Get-Location) "Backend"
if (-not (Test-Path $backendDir)) {
    Write-Host "Error: Backend directory not found!" -ForegroundColor Red
    exit 1
}
Set-Location $backendDir

Write-Host "Compiling parent monorepo and packages..." -ForegroundColor Cyan
.\mvnw.cmd clean install -DskipTests
if ($LASTEXITCODE -ne 0) {
    Write-Host "Compilation failed! Fix compile issues before running." -ForegroundColor Red
    exit 1
}

# 5. Boot services in separate windows
# Format: ModuleName, Port, TerminalTitle
$services = @(
    @("discovery-server", 8761, "Discovery Server"),
    @("identity-service", 8081, "Identity Service"),
    @("resume-service", 8082, "Resume Service"),
    @("intelligence-service", 8083, "Intelligence Service"),
    @("gateway-service", 8080, "API Gateway")
)

Write-Host "`nStarting 5 Microservices in separate windows..." -ForegroundColor Green
foreach ($svc in $services) {
    $module = $svc[0]
    $port = $svc[1]
    $title = $svc[2]
    
    Write-Host "Launching $title on port $port..." -ForegroundColor Green
    
    # Start Spring Boot application in a separate PowerShell command window
    $cmd = "`$host.ui.RawUI.WindowTitle = '$title (Port $port)'; .\mvnw.cmd spring-boot:run -pl $module"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $cmd -WorkingDirectory $backendDir
    
    if ($module -eq "discovery-server") {
        Write-Host "Waiting 5 seconds for Discovery Server to boot..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    } else {
        Start-Sleep -Seconds 1.5
    }
}

Write-Host "`nAll microservices are starting up! frontend facing port is 8080 (API Gateway)." -ForegroundColor Green
Write-Host "To shut down the services, simply close the opened PowerShell terminal windows." -ForegroundColor Cyan
