@echo off
echo ========================================================
echo        Starting ATS Resify Microservices
echo ========================================================

echo Compiling parent and common-lib...
call mvnw.cmd clean install -DskipTests

echo Starting Discovery Server (Port 8761)...
start "Discovery Server" cmd /c "cd discovery-server && ..\mvnw.cmd spring-boot:run"

echo Waiting 10 seconds for Discovery Server to boot...
timeout /t 10 /nobreak

echo Starting Gateway Service (Port 8080)...
start "Gateway Service" cmd /c "cd gateway-service && ..\mvnw.cmd spring-boot:run"

echo Starting Identity Service (Port 8081)...
start "Identity Service" cmd /c "cd identity-service && ..\mvnw.cmd spring-boot:run"

echo Starting Resume Service (Port 8082)...
start "Resume Service" cmd /c "cd resume-service && ..\mvnw.cmd spring-boot:run"

echo Starting Intelligence Service (Port 8083)...
start "Intelligence Service" cmd /c "cd intelligence-service && ..\mvnw.cmd spring-boot:run"

echo ========================================================
echo All services are starting up! Check the new windows.
echo Ensure RabbitMQ and Redis are running locally.
echo ========================================================
pause
