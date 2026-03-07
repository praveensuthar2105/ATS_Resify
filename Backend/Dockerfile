FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Install TeX Live and required fonts/packages
# Using --no-install-recommends saves over 1GB of disk space
RUN apt-get update && \
    export DEBIAN_FRONTEND=noninteractive && \
    apt-get install -y --no-install-recommends \
    texlive-latex-base \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    texlive-latex-extra \
    && rm -rf /var/lib/apt/lists/*

# Copy the pre-built JAR from the GitHub Actions context
# Note we specify target directory explicitly assuming it is included in deploy.zip
COPY target/*.jar /app/app.jar

ENV PORT=5000
ENV latex.compiler=pdflatex
ENV latex.compiler.path=pdflatex

EXPOSE 5000
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
