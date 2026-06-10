LMS_University/
│
├── backend/
│   └── decp-platform/decp-platform/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/com/decp/
│       │   │   │   ├── DecpApplication.java         # Main entry point
│       │   │   │   ├── controller/
│       │   │   │   │   ├── AuthController.java      # Auth endpoints
│       │   │   │   │   ├── UserController.java      # User CRUD
│       │   │   │   │   ├── PostController.java      # Posts CRUD
│       │   │   │   │   ├── EventController.java     # Events management
│       │   │   │   │   ├── JobController.java       # Jobs/ATS
│       │   │   │   │   ├── MessageController.java   # Messaging
│       │   │   │   │   └── AdminController.java     # Admin analytics
│       │   │   │   ├── service/
│       │   │   │   │   ├── AuthService.java         # Auth logic
│       │   │   │   │   ├── UserService.java         # User business logic
│       │   │   │   │   ├── PostService.java         # Post operations
│       │   │   │   │   ├── EventService.java        # Event management
│       │   │   │   │   ├── JobService.java          # Job operations
│       │   │   │   │   └── MessageService.java      # Messaging logic
│       │   │   │   ├── repository/
│       │   │   │   │   ├── UserRepository.java      # User queries
│       │   │   │   │   ├── PostRepository.java      # Post queries
│       │   │   │   │   ├── EventRepository.java     # Event queries
│       │   │   │   │   ├── JobRepository.java       # Job queries
│       │   │   │   │   └── MessageRepository.java   # Message queries
│       │   │   │   ├── entity/
│       │   │   │   │   ├── User.java                # User JPA entity
│       │   │   │   │   ├── Post.java                # Post JPA entity
│       │   │   │   │   ├── Event.java               # Event JPA entity
│       │   │   │   │   ├── Job.java                 # Job JPA entity
│       │   │   │   │   └── Message.java             # Message JPA entity
│       │   │   │   ├── dto/
│       │   │   │   │   ├── LoginRequest.java        # Login DTO
│       │   │   │   │   ├── UserDTO.java             # User DTO
│       │   │   │   │   ├── PostDTO.java             # Post DTO
│       │   │   │   │   └── ...
│       │   │   │   ├── security/
│       │   │   │   │   ├── JwtTokenProvider.java    # JWT utilities
│       │   │   │   │   ├── JwtAuthFilter.java       # Auth filter
│       │   │   │   │   └── SecurityConfig.java      # Spring Security config
│       │   │   │   └── exception/
│       │   │   │       ├── UserNotFoundException.java
│       │   │   │       └── UnauthorizedException.java
│       │   │   └── resources/
│       │   │       ├── application.properties       # Main config
│       │   │       ├── application-docker.properties# Docker config
│       │   │       └── db-schema.sql               # Database initialization
│       │   └── test/java/...                        # Unit tests
│       ├── pom.xml                                  # Maven dependencies
│       ├── Dockerfile                               # Docker build file
│       └── .dockerignore
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                           # Top navigation
│   │   │   ├── Sidebar.jsx                          # Side navigation
│   │   │   ├── PostCard.jsx                         # Post component
│   │   │   ├── EventCard.jsx                        # Event component
│   │   │   ├── JobCard.jsx                          # Job component
│   │   │   └── MessageBubble.jsx                    # Message component
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx                        # Authentication
│   │   │   ├── DashboardPage.jsx                    # Home dashboard
│   │   │   ├── ProfilePage.jsx                      # User profile
│   │   │   ├── MessagesPage.jsx                     # Messaging
│   │   │   ├── EventsPage.jsx                       # Events listing
│   │   │   ├── JobsPage.jsx                         # Jobs listing
│   │   │   ├── AdminPage.jsx                        # Admin dashboard
│   │   │   └── NotFoundPage.jsx                     # 404 page
│   │   ├── context/
│   │   │   └── AuthContext.jsx                      # Auth state management
│   │   ├── api/
│   │   │   └── client.js                            # Axios instance with interceptors
│   │   ├── App.jsx                                  # Root component
│   │   ├── App.css                                  # Global styles
│   │   └── main.jsx                                 # Entry point
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile                                   # Multi-stage build
│   ├── nginx.conf                                   # Nginx configuration
│   └── .dockerignore
│
├── mobile_frontend/
│   ├── src/
│   │   ├── screens/
│   │   │   ├── HomeScreen.js                        # Home feed
│   │   │   ├── MessagesScreen.js                    # Messaging
│   │   │   ├── EventsScreen.js                      # Events
│   │   │   ├── JobsScreen.js                        # Jobs
│   │   │   └── ProfileScreen.js                     # User profile
│   │   ├── navigation/
│   │   │   └── AppNavigator.js                      # Navigation structure
│   │   ├── api/
│   │   │   └── client.js                            # Axios + LocalTunnel
│   │   ├── context/
│   │   │   └── AuthContext.js                       # Auth + SecureStore
│   │   ├── App.js                                   # Root component
│   │   └── app.json                                 # Expo config
│   ├── package.json
│   └── babel.config.js
│
├── docker-compose.yml                               # Multi-container orchestration
├── .env.example                                     # Environment variables template
├── .gitignore
├── README.md                                        # This file
└── DEPLOYMENT.md                                    # Cloud deployment guide
