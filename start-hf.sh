#!/bin/bash

# Optimized JVM memory arguments to run multiple JVMs efficiently in a single container
JVM_OPTS="-XX:ActiveProcessorCount=1 -XX:MaxRAMPercentage=15.0 -XX:+UseSerialGC -Xss256k -XX:MaxMetaspaceSize=64m"

# Start Discovery Server first
echo "Starting Discovery Server..."
java $JVM_OPTS -jar discovery-server.jar > discovery.log 2>&1 &

# Wait for Discovery Server to initialize
echo "Waiting for Discovery Server to boot..."
sleep 8

# Start all downstream microservices in the background
echo "Starting downstream microservices..."
java $JVM_OPTS -jar identity-service.jar > identity.log 2>&1 &
java $JVM_OPTS -jar resume-service.jar > resume.log 2>&1 &
java $JVM_OPTS -jar intelligence-service.jar > intelligence.log 2>&1 &

# Wait for downstream services to boot
echo "Waiting for services to initialize and register..."
sleep 12

# Start API Gateway in the foreground on port 7860 (Hugging Face default web port)
echo "Starting API Gateway on port 7860..."
java $JVM_OPTS -Dserver.port=7860 -jar gateway-service.jar
