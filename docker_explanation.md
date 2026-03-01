# Masterclass: Containerizing Your Application

Docker can feel like magic, but under the hood, it is just a very organized way to package applications into isolated "boxes" (containers) that have everything they need to run perfectly on any computer in the world.

Let's break down exactly what we built for your LMS University platform.

---

## 1. Where do the files live?
To make Docker work, we placed three critical configuration files in your repository:

1. **Backend Blueprint:** `d:\LMS_University\backend\decp-platform\decp-platform\Dockerfile`
2. **Frontend Blueprint:** `d:\LMS_University\frontend\Dockerfile`
3. **The Conductor:** `d:\LMS_University\docker-compose.yml` (at the root of your project)

---

## 2. The Backend Dockerfile (Spring Boot)
The `Dockerfile` is a literal blueprint. It reads top-to-bottom and tells Docker exactly how to build a custom computer for your Java code. 

We used a **Multi-Stage Build**. This means we use a heavy "Builder" machine to compile the code, then we throw that machine away and copy *only* the finished `.jar` file into a tiny "Runner" machine. This keeps your deployment extremely cheap and fast.

```dockerfile
# STAGE 1: THE BUILDER
# Pull a heavy Linux machine that comes pre-installed with Maven and Java 17.
FROM maven:3.9.6-eclipse-temurin-17 AS build

# Create a folder inside the container called /app and switch to it.
WORKDIR /app

# Copy the pom.xml and the src/ folder from your Windows PC into the container's /app folder.
COPY pom.xml .
COPY src ./src

# Run the Maven command inside the container to compile the Java code into a .jar file. 
# We skip tests so it builds faster during deployment.
RUN mvn clean package -DskipTests


# STAGE 2: THE RUNNER
# Now, pull a brand-new, completely empty Linux machine that only has Java 17 installed (no Maven).
FROM eclipse-temurin:17-jre-jammy

# Create a folder inside this new container called /app.
WORKDIR /app

# Reach backwards into "STAGE 1" (the Builder), grab the finished .jar file it created, 
# and copy it into this new Runner container. Name it 'app.jar'.
COPY --from=build /app/target/*.jar app.jar

# Tell Docker that this container wants to speak to the outside world on port 8080.
EXPOSE 8080

# The command to execute exactly when the container turns on.
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Q&A: How Multi-Stage Works in Practice
**Question:** *So when we execute the Dockerfile line by line, it creates container 1 and container 2. Does it kill container 1 and only keep container 2 (which includes the `.jar` only) alive as the backend container?*

**Answer:** **Yes, exactly!** 
1. **Stage 1 (The Builder):** Docker creates a temporary, heavy container. It pulls your source code inside, runs the compilation, and generates the `.jar` file. 
2. **Stage 2 (The Final Container):** Docker creates a completely separate, brand-new, lightweight container.
3. **The Handoff:** Stage 2 reaches into the dead Stage 1 container, grabs **only** the finished `app.jar` file, and completely throws away Stage 1 (along with all the heavy Maven tools and raw source code).
4. **The Result:** The only thing that stays alive and gets deployed to your server is Container 2. It is incredibly tiny because it only contains the bare minimum needed to run Java and your single `.jar` file.

---

## 3. The Frontend Dockerfile (React + Nginx)
React is tricky. During development (`npm run dev`), Node.js runs a live server. But in production, React just compiles down into plain, dead HTML/CSS/JS files. Node.js cannot serve these files securely or quickly to thousands of users.

To solve this, we use exactly the same multi-stage technique, but in Stage 2, we use **Nginx** (an ultra-fast web server) instead of Java.

```dockerfile
# STAGE 1: THE BUILDER
# Pull a heavy Node.js 22 machine.
FROM node:22-alpine AS build

# Switch to the /app folder.
WORKDIR /app

# Copy your package.json and install all the heavy node_modules.
COPY package.json package-lock.json ./
RUN npm install

# Copy all the actual React code (components, pages, etc.) into the container.
COPY . .

# Run Vite to compress and bundle your React code into a tiny folder called 'dist'.
RUN npm run build


# STAGE 2: THE RUNNER (NGINX)
# Pull a tiny Linux machine running the Nginx Web Server.
FROM nginx:alpine

# Copy our custom Nginx instructions into the web server. (More on this below)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Reach backwards into "STAGE 1", grab the 'dist' folder containing the finished React HTML/JS, 
# and drop it into Nginx's public web folder where it serves sites to the internet.
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 (the default internet port for HTTP).
EXPOSE 80

# Start the Nginx web server so it stays awake permanently.
CMD ["nginx", "-g", "daemon off;"]
```

### Q&A: How the Frontend Multi-Stage Build Works
**Question:** *I don't completely understand the frontend container. Does it also use 2 containers? When executing its Dockerfile, does only the final Nginx container survive while the builder container dies?*

**Answer:** **Yes, exactly! It works identically to the Java backend.**
1. **Stage 1 (The Node Builder):** Docker spins up a heavy `node:22-alpine` container. It downloads hundreds of bulky `node_modules` and runs your Vite build script. This step compresses all your React JSX and CSS into tiny, pure static files (HTML/JS/CSS) and places them in a `dist` folder.
2. **The "Death" of Stage 1:** As soon as Vite finishes building that `dist` folder, the Node.js container's job is completely finished. It has served its purpose.
3. **Stage 2 (The Fast Nginx Runner):** Docker spins up a brand-new, blazing fast `nginx:alpine` web server container.
4. **The Handoff:** Stage 2 reaches into the dead Stage 1 container, grabs **only** the finished `dist` folder contents (your compiled website), and drops them into Nginx's public web folder. Docker then completely deletes Stage 1 (along with all the heavy `node_modules` and source code).
5. **The Result:** The only container that actually stays alive and runs on your EC2 server is the tiny Nginx container. It doesn't even have Node.js installed! It just blindly serves the pre-compiled files at lightning speed.

### What is Nginx doing? (`nginx.conf`)
Nginx is a "reverse proxy". Think of it as a bouncer at a club. 
- When a user types `yourwebsite.com/jobs`, they hit Nginx on Port 80. Nginx instantly hands them the `index.html` file we copied during the build.
- **The Magic Trick:** In your React code, you make calls to `/api/users/login`. In development, Vite handled this. In production, we told Nginx: *"If you see any network request starting with `/api/`, instantly forward that request to the Java Backend Container on Port 8080"*. 

Because Nginx acts as the middleman routing everything under one domain, your browser thinks the frontend and backend are the exact same server. **This completely destroys CORS errors.**

---

## 4. The Orchestrator: `docker-compose.yml`
Dockerfiles only build isolated containers. They don't know how to talk to each other. `docker-compose.yml` is the script that links them all together into a private, secure virtual network.

Let's read it block by block:

```yaml
version: '3.8'

# Inside this definition, we are creating three virtual machines (services).
services:
  
  # ---------- MACHINE 1: THE DATABASE ----------
  db:
    image: mysql:8.0              # Don't build anything, just download Official MySQL 8 from the internet.
    container_name: decp-mysql    # Name the machine.
    restart: always               # If the database crashes, automatically turn it back on.
    environment:
      # These set the master root password and create an empty database named 'LMS_db' instantly on boot.
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: LMS_db
    ports:
      # Map Port 3307 on your Windows PC to Port 3306 inside the container. 
      # (We changed this from 3306 so it doesn't fight your local Windows MySQL installation).
      - "3307:3306"
    volumes:
      # CRITICAL: Containers wipe all data when destroyed. We mount a "volume" (a persistent 
      # folder on your hard drive) into MySQL's brain, so your data survives reboots.
      - db_data:/var/lib/mysql
    networks:
      # Plug this machine into our custom virtual switch called 'decp-network'.
      - decp-network


  # ---------- MACHINE 2: THE BACKEND ----------
  backend:
    build:
      # Don't download an image. Build the custom Dockerfile we wrote in the backend folder!
      context: ./backend/decp-platform/decp-platform
      dockerfile: Dockerfile
    container_name: decp-backend
    restart: always
    ports:
      # Map Port 8080 on Windows to Port 8080 in the container.
      - "8080:8080"
    environment:
      # SPRING BOOT MAGIC: We override your application.properties here dynamically.
      # Notice the URL: "jdbc:mysql://db:3306/LMS_db". 
      # Because they are on the same virtual network, Docker automatically translates the 
      # word 'db' into the exact IP address of Machine 1! It does not use 'localhost'.
      - SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/LMS_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
      - SPRING_DATASOURCE_USERNAME=root
      - SPRING_DATASOURCE_PASSWORD=root
    depends_on:
      # Do not start Java until MySQL says it is completely awake.
      - db
    networks:
      - decp-network


  # ---------- MACHINE 3: THE FRONTEND ----------
  frontend:
    build:
      # Build the custom Dockerfile from the frontend folder.
      context: ./frontend
      dockerfile: Dockerfile
    container_name: decp-frontend
    restart: always
    ports:
      # Map Port 5173 on your Windows PC to Port 80 (Nginx's default) inside the container.
      - "5173:80"
    depends_on:
      # Do not start Nginx until the Backend is fully awake.
      - backend
    networks:
      - decp-network


# Define the persistent hard drive volume for MySQL.
volumes:
  db_data:

# Define the private virtual switch that lets 'backend', 'db', and 'frontend' talk securely.
networks:
  decp-network:
    driver: bridge
```

### How the Communication Works:
1. User goes to `http://localhost:5173` on Windows.
2. Docker physically grabs that traffic and throws it into Port 80 of the `frontend` container (Nginx).
3. Nginx sees the user wants to log in, so it takes the `/api/users/login` request and throws it across the internal `decp-network` bridge directly into the `backend` container on Port 8080.
4. Java receives the login request, processes the password, and throws a query across the `decp-network` directly into the `db` container on Port 3306.
5. MySQL verifies the password, hands the data back to Java, Java hands it back to Nginx, and Nginx hands it back to the user's browser.
