package controllers

import javax.inject._


import shared.SharedMessages
import play.api.mvc._
import play.api.i18n._
import play.api.data._
import play.api.libs.json
import play.api.libs.json._
import models._

import play.api.db.slick.DatabaseConfigProvider
import slick.jdbc.JdbcProfile
import slick.jdbc.PostgresProfile.api._
import scala.concurrent.ExecutionContext
import play.api.db.slick.HasDatabaseConfigProvider

@Singleton
class Application @Inject()(protected val dbConfigProvider: DatabaseConfigProvider, cc: ControllerComponents)(implicit ec: ExecutionContext) 
  extends AbstractController(cc) with HasDatabaseConfigProvider[JdbcProfile] {


    private val model = new DatabaseModel(db)

  def login = Action { implicit request =>
    Ok(views.html.login())
  }
 
  def validateUserJoin = Action { implicit request =>
    request.body.asJson.map { data => 
      val username = data("user").toString()
      val gameCode = data("code").toString()  
        if (ApplicationModel.verifyUser(gameCode, username)) {
        Ok("true")
          .withSession("username" -> username, "code" -> gameCode, "csrfToken" -> play.filters.csrf.CSRF.getToken.get.value)
        } else {
        Ok("false")
        }
      }.getOrElse(Redirect(routes.Application.login()).flashing("error" -> "Could not verify username."))
  }


  def validateUserHost = Action { implicit request =>
      request.body.asJson.map { data => 
        val username = data("user").toString()
          if (ApplicationModel.verifyUser("", username)) {
          Ok("true")
            .withSession("username" -> username, "code" -> "host", "csrfToken" -> play.filters.csrf.CSRF.getToken.get.value)
          } else {
          Ok("false")
          }
        }.getOrElse(Redirect(routes.Application.login()).flashing("error" -> "Could not verify username."))
  }

  def startGame = Action { implicit request =>
    val username = request.session.get("username").getOrElse("")
    val code = request.session.get("code").getOrElse("player")
    Ok(views.html.gameroom(username, code))
  }

  def validatecsrf = Action { implicit request =>
    Ok(views.html.login()).withSession("csrfToken" -> play.filters.csrf.CSRF.getToken.get.value)
  }



  //Database functions
  def addGameDB(code: String, rounds: Int): Unit = {

  }

  def addUserQDB(question: String, code: String):Unit = {

  }

  def getQuestion(code: String, numQ: Int): List[String] = {

  }

  def upVDB(question: String, code: String):Unit = {

  }
  def downVDB(question: String, code: String):Unit ={

  }
}
