# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn package -DskipTests -B

# Stage 2: Run
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Install Docker CLI and git for app deployment
RUN apk add --no-cache docker-cli git

COPY --from=build /app/target/*.jar app.jar

# Verzeichnis fuer externe Konfiguration (portal-init.yml)
RUN mkdir -p /app/config

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
