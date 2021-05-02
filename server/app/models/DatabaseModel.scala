package  models

import slick.jdbc.PostgresProfile.api._
import scala.concurrent.ExecutionContext
// import models.Tables._
import scala.concurrent.Future
import scala.util.Random

// Notes: id is the row id for each table in SQL; game_id is the forein key for the id of a game row
//        gameCode is the 6-letter string used to identify each game by the actor system
class DatabaseModel(db: Database)(implicit ec: ExecutionContext) {
    /*
    // Adds a game if it doesn't exist already
    def addGame(gameCode: String, numRounds: Int): Future[Option[Int]] = {
        val matches = db.run(Games.filter(gameRow => gameRow.game_code === gameCode).result)
        matches.flatMap { gameRows =>
            if (gameRows.isEmpty) {
                db.run(Games += GamesRow(-1, gameCode, numRounds))
                .flatMap { addCount =>
                    if (addCount > 0) db.run(GameRows.filter(gameRow => gameRow.game_code === gameCode).result)
                    .map(_.headOption.map(_.id))
                    else Future.successful(None)
                }
            } else Future.successful(None)
        }
    }

    // Add question to the default questions database
    def addDefaultQuestion(question: String): Future[Int] = {
        db.run(DefaultQuestions += DefaultQuestionsRow(-1, question))
    }

    // Add question to the user questions database if the game ID exists
    // Currently this function may return a Future of Option of the number of questions associated with the game;
    def addUserQuestion(question: String, gameCode: String): Future[Option[Int]] = {
        val matches = db.run(Games.filter(gameRow => gameRow.game_code === gameCode).result)
        matches.flatMap { gameRows => 
            val gameId = gameRows(1).id
            if (gameRows.nonEmpty) {
                db.run(UserQuestions += UserQuestionsRow(-1, question, gameId))
                .flatMap { addCount => 
                    if (addCount > 0) db.run(UserQuestionsRows.filter(userQuestionRow => userQuestionRow.game_id === gameId).result)
                    .map(_.headOption.map(_.id))
                    else Future.successful(None)
                }
            } else {
                Future.successful(None)
            }
        }
    }

    // This should take the game code, find the game_id from that code, then get all the user questions associated with the game_id
    def getUserQuestions(gameCode: String): Future[Seq[String]] = {
        db.run(
        (for {
            game <- Games if game.game_code === gameCode
            userQuestion <- UserQuestions if userQuestion.game_id === game.id
        } yield {
            userQuestion
        }).result
        ).map(userQuestions => userQuestions.map(_.question))
    }

    // This should get all questions from the default database
    def getDefaultQuestions: Future[Seq[String]] = {
        db.run(
            (for (defaultQuestion <- DefaultQuestions) yield {
                defaultQuestion
            }).result
        ).map(defaultQuestions => defaultQuestions.map(_.question))
    }

    // number is the number of questions to retrieve
    // gameCode is optional; if none is passed in, will get all default questions; else will try to find questions associated with user
    // getdefault and getuser will be Future[Seq[String]] so this will require a bit more work to convert them
    // Shuffling is an extremely inefficient way to get random items
    def getQuestions(number: Int, gameCode: Option[String]): Future[Seq[String]] = {
        gameCode match {
            case None => getDefaultQuestions(number)
            case Some(id: String) => {
                val userQuestions = getUserQuestions(id).map(qs => scala.util.Random.shuffle(qs))
                val defaultQuestions = getDefaultQuestions.map(qs => scala.util.Random.shuffle(qs))
                val uqLength = userQuestions.length()
                if (uqLength > number) {
                    userQuestions.map(_.take(number))
                } else if (uqLength == number) {
                    userQuestions
                } else {
                    // Absolutely zero clue if this will work...
                    val diff = number - uqLength
                    val newseq = Seq(defaultQuestions.map(_.take(diff)), userQuestions)
                    newseq.flatMap(_.flatMap(_))
                    // somehow have to add userQuestions and getDefaultQuestions(number - uqLength) since they're both futures
                }
                
            }
        }
    }
*/
}