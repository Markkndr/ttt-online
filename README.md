# TTT Online

An online multiplayer Ultimate Tic-Tac-Toe game built for real-time gameplay between friends.

## Features

- Real-time multiplayer gameplay
- Online room creation and joining
- Fast and responsive game state updates
- Turn validation and winner detection
- Responsive UI for desktop and mobile
- Restart/rematch functionality

## Tech Stack

Update this section based on your implementation.

### Frontend
- React
- Websocket

### Backend
- Spring Boot
- Spring Data JPA
- Maven

### Database *(optional)*
- PostgreSQL

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js (v18+ recommended)
- npm or yarn

## Installation

Clone the repository:

```bash
git clone https://github.com/Markkndr/ttt-online.git
cd ttt-online
```

---

# Backend Setup \(Spring Boot\)

## Prerequisites

Install the following:

- Java 17+ 
- Maven
- IntelliJ IDEA / VS Code *(recommended)*

Verify installation:

```bash
java -version
mvn -version
```

## Install Backend Dependencies

Navigate to the backend folder:

```bash
cd backend
```

Install dependencies and build the project:

```bash
mvn clean install
```

## Run Spring Boot Server

```bash
mvn spring-boot:run
```

The backend server will start on:

```txt
http://localhost:8080
```

---

# Frontend Setup \(React\)

## Prerequisites

Install the following:

- Node.js \(v18+ recommended\)
- npm or yarn

Verify installation:

```bash
node -v
npm -v
```

## Install Frontend Dependencies

Navigate to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

or

```bash
yarn install
```

## Run React Development Server

```bash
npm start
```

or

```bash
yarn start
```

The frontend application will run on:

```txt
http://localhost:3000
```

---

## Running the Project

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## Environment Variables

Create a `.env` file in the root directory and configure the following variables:

```env
PORT=3000
CLIENT_URL=http://localhost:3000
```

## Gameplay

1. Create a game room
2. Share the room code with another player
3. Join the room
4. Play Ulatimate Tic-Tac-Toe in real time
5. Restart or create a new match after the game ends

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Build production app
npm start         # Run production build
npm run lint      # Run linter
```

## Future Improvements

- Player authentication
- Leaderboard
- AI opponent mode
- In-game chat

## License

This project is licensed under the MIT License.
