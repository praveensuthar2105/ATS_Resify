# Step 1: Build all modules
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy the pom.xml and source code modules
COPY Backend/pom.xml ./Backend/pom.xml
COPY Backend/common-lib ./Backend/common-lib
COPY Backend/discovery-server ./Backend/discovery-server
COPY Backend/gateway-service ./Backend/gateway-service
COPY Backend/identity-service ./Backend/identity-service
COPY Backend/resume-service ./Backend/resume-service
COPY Backend/intelligence-service ./Backend/intelligence-service

# Build the project
RUN mvn -f Backend/pom.xml clean install -DskipTests

# Step 2: Runtime environment
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Install TeX Live (LaTeX) and required fonts/packages for resume generation
RUN apt-get update && \
    export DEBIAN_FRONTEND=noninteractive && \
    apt-get install -y --no-install-recommends \
    texlive-latex-base \
    texlive-fonts-recommended \
    texlive-latex-extra \
    && rm -rf /var/lib/apt/lists/*

# Copy built JARs from build stage
COPY --from=build /app/Backend/discovery-server/target/*.jar ./discovery-server.jar
COPY --from=build /app/Backend/gateway-service/target/*.jar ./gateway-service.jar
COPY --from=build /app/Backend/identity-service/target/*.jar ./identity-service.jar
COPY --from=build /app/Backend/resume-service/target/*.jar ./resume-service.jar
COPY --from=build /app/Backend/intelligence-service/target/*.jar ./intelligence-service.jar

# Copy startup script
COPY start-prod.sh ./start-prod.sh
RUN chmod +x ./start-prod.sh

# Expose standard container port
EXPOSE 8080

# Run all services via the production startup script
ENTRYPOINT ["./start-prod.sh"]
