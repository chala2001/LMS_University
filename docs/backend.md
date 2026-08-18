# LMS University Backend Documentation

## 1. Architecture Overview
The backend is structured as a monolithic **Spring Boot** application (named `decp-platform`) internally modularized by features, which closely mimics a Service-Oriented Architecture (SOA) pattern within a single deployable unit. 

### Technology Stack
- **Framework:** Spring Boot 3.x / Java 17
- **Database Access:** Spring Data JPA
- **Database:** MySQL
- **Security:** Spring Security & JWT (JSON Web Tokens)
- **Build Tool:** Maven

### Modularity
The application is divided into feature-based packages representing individual domain "services":
- `analytics`, `comment`, `event`, `job`, `like`, `messaging`, `notification`, `post`, `research`, `user`

## 2. Security & Authentication
The application employs stateless authentication using JSON Web Tokens (JWT). 
- **Stateless Session:** No server-side sessions are created; every secured request must include a valid JWT.
- **Password Hashing:** `BCryptPasswordEncoder` is used to securely hash user passwords.
- **Public Endpoints:** 
  - `POST /api/users/register`
  - `POST /api/users/login`
- **Secured Endpoints:** All other API paths require a valid standard Bearer JWT token in the `Authorization` header.

---

## 3. Testing Status
- **Current State:** The backend lacks functional unit and integration tests. The only existing test is the default `DecpPlatformApplicationTests` which verifies if the Spring Application Context loads.
- **Test Execution:** Attempting to run the existing build (`mvnw test`) failed due to environmental misconfiguration on the host system (specifically, `JAVA_HOME` is either unset or incorrectly configured).
- **Recommendation:** Implement comprehensive tests (using JUnit & Mockito) for controllers, services, and repositories to assure functionality for the entire SOA architecture.

---

## 4. API Reference

### 👤 User Module (`/api/users`)
| Method | Endpoint | Description | Payload / Request Params |
|--------|----------|-------------|----------------------------|
| `POST` | `/register` | Register a new user | `RegisterRequest` body (email, password, etc) |
| `POST` | `/login` | Authenticate a user | `LoginRequest` body (email, password) |
| `GET`  | `/me` | Get current user profile | - |
| `PUT`  | `/me` | Update current user profile | `UpdateProfileRequest` body |
| `PUT`  | `/{id}/role` | Change a user's role | Query param: `role` |

### 📝 Post Module (`/api/posts`)
| Method | Endpoint | Description | Payload / Request Params |
|--------|----------|-------------|----------------------------|
| `GET`  | `/` | Get all posts | - |
| `POST` | `/` | Create a new post | `PostRequest` body |
| `PUT`  | `/{postId}` | Update an existing post | `UpdatePostRequest` body |
| `DELETE`| `/{postId}`| Delete a post | - |
| `POST` | `/{postId}/like` | Toggle like on a post | - |
| `GET`  | `/{postId}/comments`| Get comments for a post| - |
| `POST` | `/{postId}/comments`| Add a comment to a post| `CommentRequest` body |

### 🔬 Research Module (`/api/research`)
| Method | Endpoint | Description | Payload / Request Params |
|--------|----------|-------------|----------------------------|
| `GET`  | `/` | Get all research projects| - |
| `POST` | `/` | Create a research project | Query Params: `title`, `description`|
| `GET`  | `/{id}/members` | Get project members | - |
| `POST` | `/{id}/join` | Join a research project | - |
| `PUT`  | `/{id}` | Update research project | Query Params: `title`, `description`|
| `DELETE`| `/{id}` | Delete research project | - |

### 💼 Job Module (`/api/jobs`)
| Method | Endpoint | Description | Payload / Request Params |
|--------|----------|-------------|----------------------------|
| `GET`  | `/` | Get all jobs | - |
| `POST` | `/` | Create a new job | `JobRequest` body |
| `POST` | `/{jobId}/apply` | Apply to a job | - |
| `PUT`  | `/{id}` | Update a job | `JobRequest` body |
| `DELETE`| `/{id}` | Delete a job | - |

### 📅 Event Module (`/api/events`)
| Method | Endpoint | Description | Payload / Request Params |
|--------|----------|-------------|----------------------------|
| `GET`  | `/` | Get all events | - |
| `POST` | `/` | Create an event | `EventRequest` body |
| `POST` | `/{eventId}/rsvp` | RSVP to an event | Query Param: `status` |
| `PUT`  | `/{id}` | Update an event | `EventRequest` body |
| `DELETE`| `/{id}` | Delete an event | - |

### 💬 Messaging Module (`/api/messages`)
| Method | Endpoint | Description | Payload / Request Params |
|--------|----------|-------------|----------------------------|
| `GET`  | `/{userId}` | Get a conversation | - |
| `POST` | `/{receiverId}`| Send a message | Query Param: `content` |

### 🔔 Notification Module (`/api/notifications`)
| Method | Endpoint | Description | Payload / Request Params |
|--------|----------|-------------|----------------------------|
| `GET`  | `/` | Get user notifications | - |
| `PUT`  | `/{id}/read` | Mark a notification as read | - |
| `PUT`  | `/read-all` | Mark all notifications read | - |

### 📊 Analytics Module (`/api/analytics`)
| Method | Endpoint | Description | Payload / Request Params |
|--------|----------|-------------|----------------------------|
| `GET`  | `/` | Get analytics dashboard | - |
