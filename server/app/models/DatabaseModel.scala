package  models

import slick.jdbc.PostgresProfile.api._
import scala.concurrent.ExecutionContext
// import models.._
import scala.concurrent.Future
import scala.util.Random

class DatabaseModel(db: Database)(implicit ec: ExecutionContext) {
    val rand = Random

    def addGame(gameId: String, numRounds: Int): Future[Option[Int]] = {
        val matches = db.run(Games.filter(gameRow => gameRow.game_id === gameId).result)
        matches.flatMap { gameRows =>
            if (gameRows.isEmpty) {
                db.run(Games += GamesRow(-1, gameId, numRounds))
                .flatMap { addCount =>
                    if (addCount > 0) db.run(GameRows.filter(gameRow => gameRow.game_id === GameId).result)
                    .map(_.headOption.map(_.id))
                    else Future.successful(None)
                }
            } else Future.successful(None)
        }
    }
    

    def addDefaultQuestion(question: String): Future[Int] = {
        db.run(DefaultQuestions += DefaultQuestionsRow(-1, question))
    }

    def addUserQuestion(question: String, gameId: String): Boolean = ???

    def getUserQuestions(gameId: String): Seq[String] = {
        db.run(
        (for {
            message <- Messages if message.receiver === 0
        } yield {
            message
        }).result
        ).map(messages => messages.map(message => Message(message.sender, message.text)))
    }

    def getDefaultQuestions(number: Int): Future[Seq[String]] = {
        // the map may be unnecessary actually...
        db.run(
            (for (message <- Messages) yield {
                message
            }).result
        ).map(questions => questions.map(question => question.question))
    }

    // number is the number of questions to retrieve
    // getdefault and getuser will be Future[Seq[String]]
    def getQuestions(number: Int, gameId: Option[String]): Future[Seq[String]] = {
        gameId match {
            case None => getDefaultQuestions(number)
            case Some(id: String) => {
                val userQuestions = getUserQuestions(id)
                val uqLength = userQuestions.length()
                if (uqLength > number) {
                    userQuestions.take(number)
                } else if (uqLength == number) {
                    userQuestions
                } else {
                    userQuestions 
                    // somehow have to add userQuestions and getDefaultQuestions(number - uqLength) since they're both futures
                }
                
            }
        }
    }

}