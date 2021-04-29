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
class Application @Inject()(cc: ControllerComponents) extends AbstractController(cc) {

  def login = Action { implicit request =>
    Ok(views.html.login())
  }

  /*def validateUserJoin = Action { implicit request =>
    val postvals = request.body.asFormUrlEncoded
    postvals.map { args =>
      val username = "test"
      val gameCode = args("txtGameCodeJoin").head
      if (ApplicationModel.verifyUser(gameCode, username)) {
        Ok(views.html.gameroom(username, "player"))
        .withSession("username" -> username, "code" -> gameCode, "state" -> "player", "csrfToken" -> play.filters.csrf.CSRF.getToken.get.value)
      } else {
        Redirect(routes.Application.login()).flashing("error" -> "Could not verify username or Game Code.")
      }
    }.getOrElse(Redirect(routes.Application.login())) 
  }*/

  def validateUserJoin = Action { implicit request =>
    request.body.asJson.map { data => 
      val username = data("user").toString()
      val gameCode = data("code").toString()  
        if (ApplicationModel.verifyUser(gameCode, username)) {
        println("succeeded check")
        Ok("true")
          .withSession("username" -> username, "code" -> gameCode, "csrfToken" -> play.filters.csrf.CSRF.getToken.get.value)
        } else {
          println("Failed check")
        Ok("false")
        }
      }.getOrElse(Redirect(routes.Application.login()).flashing("error" -> "Could not verify username."))
  }


  def validateUserHost = Action { implicit request =>
      request.body.asJson.map { data => 
        val username = data("user").toString()
          if (ApplicationModel.verifyUser("", username)) {
          println("succeeded check")
          Ok("true")
            .withSession("username" -> username, "code" -> "host", "csrfToken" -> play.filters.csrf.CSRF.getToken.get.value)
          } else {
            println("Failed check")
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

}
