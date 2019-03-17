CREATE EXTENSION pgcrypto;

CREATE TABLE players (
    id serial NOT NULL,
    name VARCHAR(20) NOT NULL,
    highscore bigint DEFAULT 0,
    password TEXT NOT NULL,
    PRIMARY KEY (id)
);