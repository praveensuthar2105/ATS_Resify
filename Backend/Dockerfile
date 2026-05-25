# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy maven wrapper and pom.xml
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
# Download dependencies first (caching layer)
RUN ./mvnw dependency:go-offline

# Copy source code and build
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Setup the Runtime environment
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Install TeX Live and required fonts/packages for resume generation
# Using --no-install-recommends saves over 1GB of disk space
RUN apt-get update && \
    export DEBIAN_FRONTEND=noninteractive && \
    apt-get install -y --no-install-recommends \
    texlive-latex-base \
    texlive-fonts-recommended \
    texlive-latex-extra \
    && rm -rf /var/lib/apt/lists/*

# Copy the built JAR from Stage 1
COPY --from=build /app/target/*.jar /app/app.jar

# Expose port and set environment variables
ENV PORT=8080
ENV LATEX_COMPILER=pdflatex
ENV LATEX_COMPILER_PATH=pdflatex

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
