CREATE EXTENSION IF NOT EXISTS citext;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS refresh_token CASCADE;

CREATE TABLE users
(
    id                BIGSERIAL PRIMARY KEY,
    email             CITEXT    NOT NULL UNIQUE,
    username          CITEXT    NOT NULL UNIQUE,
    password_hash     TEXT      NOT NULL,
    birth_date        TIMESTAMP NOT NULL,
    roles             TEXT[]    NOT NULL DEFAULT '{}',
    registration_date DATE      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE games
(
    id             SERIAL PRIMARY KEY,
    creation_date  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    creator_id     INTEGER REFERENCES users (id),
    name           VARCHAR(255) NOT NULL,
    game_state     VARCHAR(100) NOT NULL CHECK (game_state IN ('WAITING', 'IN_PROGRESS', 'ENDED')),
    winner         INTEGER REFERENCES users (id),
    max_players    INTEGER,
    board_state    VARCHAR(100),
    current_player INTEGER REFERENCES users (id),
    active_board   VARCHAR(10)
);

CREATE TABLE players
(
    game_id    INTEGER REFERENCES games (id) NOT NULL,
    user_id    INTEGER REFERENCES users (id) NOT NULL,
    character  VARCHAR(1),
    PRIMARY KEY (game_id, user_id)
);

CREATE TABLE refresh_token
(
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES users (id) NOT NULL,
    token_hash  TEXT      NOT NULL,
    expires_at  TIMESTAMP NOT NULL,
    revoked     BOOLEAN   DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

CREATE INDEX idx_refresh_token_hash ON refresh_token(token_hash);
