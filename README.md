<div align="center">

# ⭕ TTT Online ❌

### Real-time multiplayer **Ultimate Tic-Tac-Toe**

Play the strategic 9-boards-in-a-board variant against your friends over the web, with live moves, accounts, and rematches.

<br>

<img src="https://img.shields.io/badge/Java-21-007396?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 21">
<img src="https://img.shields.io/badge/Spring_Boot-4.0.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot 4.0.2">
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19">
<img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
<img src="https://img.shields.io/badge/WebSocket-STOMP-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="WebSocket STOMP">

</div>

---

## 📑 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)

---

## 🎯 About

**TTT Online** is a full-stack web app for playing **Ultimate Tic-Tac-Toe** — the variant where every cell of the main board contains its own 3×3 board. Your move decides which board your opponent must play in next, turning a simple childhood game into a deep strategic duel.

The backend keeps every game's state in sync in real time over WebSockets, handles user accounts with JWT authentication, and persists everything to PostgreSQL so games and stats survive a refresh.

---

## ✨ Features

- 🎮 **Real-time multiplayer** — moves stream instantly to both players over STOMP/WebSocket
- 🧩 **Full Ultimate Tic-Tac-Toe rules** — active-board tracking, small-board wins, overall winner detection
- 🔐 **Secure accounts** — register, log in, JWT access tokens with refresh-token rotation and logout
- 🏠 **Lobby system** — create games, browse available/active/joined games, join, start, and leave
- 👤 **Player profiles** — view your profile and upload/delete a profile image
- 🛡️ **Robust error handling** — centralized exception handling with clean error responses
- 🐳 **Docker-ready backend** — ships with a `Dockerfile`

---

## 🛠 Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, Vite, React Router 7, `@stomp/stompjs`, SockJS |
| **Backend** | Java 21, Spring Boot 4, Spring Security, Spring WebSocket, Spring Data JPA / JDBC |
| **Auth** | JWT (jjwt 0.11.5), refresh tokens, BCrypt-style password hashing |
| **Database** | PostgreSQL (with `citext` for case-insensitive emails/usernames) |
| **Tooling** | Maven, Docker |

---

## 🏗 Architecture

```
┌──────────────┐    REST (auth, lobby, profile)   ┌────────────────────┐
│              │ ───────────────────────────────► │                    │
│  React + Vite│                                   │   Spring Boot API  │
│  (frontend)  │ ◄══════ WebSocket / STOMP ══════► │   (TTT-backend)    │
│              │        live moves & state         │                    │
└──────────────┘                                   └─────────┬──────────┘
                                                             │ JPA / JDBC
                                                             ▼
                                                     ┌────────────────┐
                                                     │   PostgreSQL   │
                                                     └────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Java 21+** and **Maven**
- **Node.js 18+** and **npm**
- A running **PostgreSQL** instance

### 1. Clone the repository

```bash
git clone https://github.com/Markkndr/ttt-online.git
cd ttt-online
```

### 2. Set up the database

Create a database and run the provided schema:

```bash
psql -U postgres -d your_database -f TTT-backend/database.sql
```

### 3. Run the backend

```bash
cd TTT-backend
./mvnw spring-boot:run
```

The API starts on **http://localhost:8080**.

### 4. Run the frontend

```bash
cd TTT-frontend
npm install
npm run dev
```

The app starts on **http://localhost:5173** (default Vite port).

---

## ⚙️ Configuration

Backend settings live in `TTT-backend/src/main/resources/application.properties`. You'll typically want to configure your datasource and JWT secret, for example:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/your_database
spring.datasource.username=your_user
spring.datasource.password=your_password
```

The frontend reads its API/WebSocket base URL from `TTT-frontend/.env`.

> 💡 Never commit real secrets. Use environment variables or a local, untracked `.env` for production values.

---

## 📡 API Reference

### Authentication — `/api/auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/register` | Create a new account |
| `POST` | `/login` | Log in and receive tokens |
| `POST` | `/refresh` | Exchange a refresh token for a new access token |
| `POST` | `/logout` | Invalidate the current session |

### Games — `/api/games`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/create` | Create a new game |
| `GET` | `/mine` | Games you created |
| `GET` | `/available` | Open games to join |
| `GET` | `/active` | Games in progress |
| `GET` | `/joined` | Games you've joined |
| `PATCH` | `/{gameId}/join` | Join a game |
| `PATCH` | `/{gameId}/leave` | Leave a game |
| `PATCH` | `/{gameId}/start` | Start a game |
| `PATCH` | `/{gameId}/end` | End a game |
| `GET` | `/{gameId}` | Get current game status |

### Real-time — WebSocket (STOMP)

| Destination | Description |
|-------------|-------------|
| `/{gameId}/move` | Send a move; updates are broadcast to both players |

### Profile — `/api/user`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/me` | Get your profile |
| `POST` | `/upload-image` | Upload a profile image |
| `DELETE` | `/delete-image` | Remove your profile image |

---

## 📂 Project Structure

```
ttt-online/
├── TTT-backend/                  # Spring Boot API
│   ├── src/main/java/.../tttbackend/
│   │   ├── configuration/        # Security, WebSocket, CORS config
│   │   ├── controller/           # REST + WebSocket controllers, DTOs
│   │   ├── dao/                  # Repositories & JPA models (Game, Player, User…)
│   │   ├── domain/game/          # Game logic, BigBoard / SmallBoard
│   │   ├── security/             # JWT utils, auth filter, password hashing
│   │   └── service/              # Auth, game, user, refresh-token services
│   ├── database.sql              # PostgreSQL schema
│   └── Dockerfile
└── TTT-frontend/                 # React + Vite client
    └── src/
```

---

<div align="center">

Built with ☕ and ⚛️ — have fun playing!

</div>
