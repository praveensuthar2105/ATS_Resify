#!/bin/bash

# Optimized JVM memory arguments to run multiple JVMs efficiently in a single container
JVM_OPTS="-XX:ActiveProcessorCount=1 -XX:MaxRAMPercentage=20.0 -XX:+UseSerialGC -Xss256k -XX:MaxMetaspaceSize=64m"

# Start all downstream microservices in the background
echo "Starting downstream microservices..."
java $JVM_OPTS -jar auth-service.jar > auth.log 2>&1 &
java $JVM_OPTS -jar user-service.jar > user.log 2>&1 &
java $JVM_OPTS -jar resume-service.jar > resume.log 2>&1 &
java $JVM_OPTS -jar ats-service.jar > ats.log 2>&1 &
java $JVM_OPTS -jar agent-service.jar > agent.log 2>&1 &
java $JVM_OPTS -jar admin-service.jar > admin.log 2>&1 &
java $JVM_OPTS -jar support-service.jar > support.log 2>&1 &

# Wait for downstream services to boot
echo "Waiting for services to initialize..."
sleep 15

# Start API Gateway in the foreground on port 7860 (Hugging Face default web port)
echo "Starting API Gateway on port 7860..."
java $JVM_OPTS -Dserver.port=7860 -jar gateway-service.jar
