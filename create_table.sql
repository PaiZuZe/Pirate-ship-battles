CREATE TABLE players (
    id serial NOT NULL,
    name VARCHAR(20) NOT NULL,
    highscore bigint DEAFAULT 0,
    PRIMARY KEY (id)
);