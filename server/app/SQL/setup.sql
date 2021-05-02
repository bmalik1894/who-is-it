CREATE USER admin WITH PASSWORD 'password';

CREATE DATABASE game WITH OWNER=admin;

CREATE TABLE UserQuestions (
     id SERIAL PRIMARY KEY, 
     question varchar(255) NOT NULL, 
     game_id int4 NOT NULL REFERENCES games(id) ON DELETE CASCADE,
     upvote INT DEFAULT 0,
     downvote INT DEFAULT 0
);

CREATE TABLE DefaultQuestions (
    id SERIAL PRIMARY KEY, 
    question varchar(255) NOT NULL, 
);

CREATE TABLE Games (
	id SERIAL PRIMARY KEY,
	game_code varchar(6) NOT NULL,
    rounds int4 NOT NULL,
);