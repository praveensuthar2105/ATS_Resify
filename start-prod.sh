#!/bin/bash

# Optimized JVM memory arguments to run multiple JVMs efficiently in a single container.
# These parameters are tuned to minimize memory footprint:
# - ActiveProcessorCount=1: Restricts threads to avoid high CPU context switching.
# - MaxRAMPercentage=15.0: Sets the max heap dynamically based on total RAM.
# - UseSerialGC: Low-overhead garbage collector, perfect for low-memory environments.
# - Xss256k: Reduces thread stack size from the 1MB default.
# - MaxMetaspaceSize=64m: Caps metaspace usage.
JVM_OPTS="-XX:ActiveProcessorCount=1 -XX:MaxRAMPercentage=15.0 -XX:+UseSerialGC -Xss256k -XX:MaxMetaspaceSize=64m"

# Default port for the API Gateway
PORT=${PORT:-8080}

echo "=========================================================="
echo "Starting ATS Resify Backend Services in a Unified Container"
echo "Target Port (API Gateway): $PORT"
echo "=========================================================="

# Start Discovery Server first
echo "Starting Discovery Server..."
java $JVM_OPTS -jar discovery-server.jar > discovery.log 2>&1 &

# Wait for Discovery Server to initialize
echo "Waiting for Discovery Server to boot..."
sleep 10

# Start downstream microservices in the background
echo "Starting Identity Service..."
java $JVM_OPTS -jar identity-service.jar > identity.log 2>&1 &

echo "Starting Resume Service..."
java $JVM_OPTS -jar resume-service.jar > resume.log 2>&1 &

echo "Starting Intelligence Service..."
java $JVM_OPTS -jar intelligence-service.jar > intelligence.log 2>&1 &

# Wait for downstream services to boot and register
echo "Waiting for services to register with Discovery Server..."
sleep 15

# Start API Gateway in the foreground on the configured port
echo "Starting API Gateway on port $PORT..."
java $JVM_OPTS -Dserver.port=$PORT -jar gateway-service.jar
