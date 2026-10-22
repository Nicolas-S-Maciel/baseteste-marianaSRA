# Build: compila o jar com o Maven Wrapper do projeto
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN sh mvnw -q -B dependency:go-offline
COPY src/ src/
RUN sh mvnw -q -B -DskipTests package && cp target/*.jar app.jar

# Runtime: só a JRE + o jar
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --uid 1001 spring
COPY --from=build /app/app.jar app.jar
USER spring
# Plano gratuito do Render tem 512 MB: limita o heap para caber
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=70 -XX:+UseSerialGC -Xss512k"
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
