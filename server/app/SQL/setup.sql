CREATE USER admin WITH PASSWORD 'password';

CREATE DATABASE game WITH OWNER=admin;

CREATE TABLE userQuestions (
     id SERIAL PRIMARY KEY, 
     question varchar(255) NOT NULL, 
     upvote INT DEFAULT 0,
     downvote INT DEFAULT 0
);

CREATE TABLE defaultQuestions (
    id SERIAL PRIMARY KEY, 
    question varchar(255) NOT NULL, 
);

CREATE TABLE games (
	games_id SERIAL PRIMARY KEY, //String
	questions_id int4 NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    roundsNum int4 NOT NULL,
    numPlayers int4 NOT NULL,
	text varchar(2000) NOT NULL
);