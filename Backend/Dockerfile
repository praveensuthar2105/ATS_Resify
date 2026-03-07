# Stage 1: Build the application using Maven
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies first to cache them
RUN mvn dependency:go-offline -B
# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Create the final Docker image with Java 21 and LaTeX (TeX Live)
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Install TeX Live and required fonts/packages
# This includes pdflatex and common resume packages
RUN apt-get update && \
    export DEBIAN_FRONTEND=noninteractive && \
    apt-get install -y --no-install-recommends \
    texlive-latex-base \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    texlive-latex-extra \
    && rm -rf /var/lib/apt/lists/*

# Copy the JAR from the build stage
COPY --from=build /app/target/*SNAPSHOT.jar /app/app.jar

# Default PORT for AWS Elastic Beanstalk
ENV PORT=5000

# Explicitly tell the Spring Boot app to use pdflatex via environment properties
ENV latex.compiler=pdflatex
ENV latex.compiler.path=pdflatex

EXPOSE 5000

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
