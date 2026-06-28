@echo off
echo ========================================================
echo        Stopping ATS Resify Microservices
echo ========================================================

echo Stopping Java processes...
taskkill /F /FI "WINDOWTITLE eq Discovery Server*" /T
taskkill /F /FI "WINDOWTITLE eq Gateway Service*" /T
taskkill /F /FI "WINDOWTITLE eq Identity Service*" /T
taskkill /F /FI "WINDOWTITLE eq Resume Service*" /T
taskkill /F /FI "WINDOWTITLE eq Intelligence Service*" /T

echo All backend services stopped.
pause
