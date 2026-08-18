# Stage 1: Build the application using Maven
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the pom.xml and source code
COPY pom.xml .
COPY src ./src

# Package the application (skip tests to speed up the build during deployment testing)
RUN mvn clean package -DskipTests

# Stage 2: Create the lightweight runtime image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy only the built JAR file from the first stage
COPY --from=build /app/target/*.jar app.jar

# Expose port 8080 which the Spring Boot application uses
EXPOSE 8080

# Command to execute the JAR
ENTRYPOINT ["java", "-jar", "app.jar"]
