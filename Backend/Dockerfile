FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Install TeX Live and required fonts/packages
# Using --no-install-recommends saves over 1GB of disk space
# Removed texlive-fonts-extra because it causes "No space left on device" errors on t3.small instances
RUN apt-get update && \
    export DEBIAN_FRONTEND=noninteractive && \
    apt-get install -y --no-install-recommends \
    texlive-latex-base \
    texlive-fonts-recommended \
    texlive-latex-extra \
    && rm -rf /var/lib/apt/lists/*

# Copy the pre-built JAR from the GitHub Actions context
# Note we specify target directory explicitly assuming it is included in deploy.zip
COPY target/app.jar /app/app.jar

# Cloud Run injects PORT=8080 at runtime; fallback to 8080 for local testing
ENV PORT=8080
ENV LATEX_COMPILER=pdflatex
ENV LATEX_COMPILER_PATH=pdflatex

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
