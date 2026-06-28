FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Install TeX Live and required fonts/packages for resume generation
RUN apt-get update && \
    export DEBIAN_FRONTEND=noninteractive && \
    apt-get install -y --no-install-recommends \
    texlive-latex-base \
    texlive-fonts-recommended \
    texlive-latex-extra \
    && rm -rf /var/lib/apt/lists/*

COPY target/*.jar app.jar
ENV PORT=8082
ENV LATEX_COMPILER=pdflatex
ENV LATEX_COMPILER_PATH=pdflatex

EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
