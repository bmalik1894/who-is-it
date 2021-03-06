package controllers

import javax.inject._


import shared.SharedMessages
import play.api.mvc._
import play.api.i18n._
import play.api.data._
import play.api.libs.json
import play.api.libs.json._
import models._

@Singleton
//class Application @Inject()(protected val dbConfigProvider: DatabaseConfigProvider, cc: ControllerComponents)(implicit ec: ExecutionContext) 
//  extends AbstractController(cc) with HasDatabaseConfigProvider[JdbcProfile] {
class Application @Inject()(cc: ControllerComponents) extends AbstractController(cc) { 


 //   private val model = new DatabaseModel(db)

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
          Ok("true")
            .withSession("username" -> username, "code" -> "host", "csrfToken" -> play.filters.csrf.CSRF.getToken.get.value)
        }.getOrElse(Redirect(routes.Application.login()).flashing("error" -> "Could not verify username."))
  }

  def startGame = Action { implicit request =>
    val username = request.session.get("username").getOrElse("")
    val code = request.session.get("code").getOrElse("player")
    val token = request.session.get("csrfToken").getOrElse("")
    Ok(views.html.gameroom(username, code, token))
  }

  def validatecsrf = Action { implicit request =>
    Ok(views.html.login()).withSession("csrfToken" -> play.filters.csrf.CSRF.getToken.get.value)
  }
  
}
