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

  def validateUserJoin = Action { implicit request =>
    val postvals = request.body.asFormUrlEncoded
    postvals.map { args =>
      val username = args("txtUsernameJoin").head
      val gameCode = args("txtGameCodeJoin").head
      if (ApplicationModel.verifyUser(gameCode, username)) {
        Ok(views.html.waitingroom())
        .withSession("username" -> username, "code" -> gameCode, "state" -> "player", "csrfToken" -> play.filters.csrf.CSRF.getToken.get.value)
      } else {
        Redirect(routes.Application.login()).flashing("error" -> "Could not verify username or Game Code.")
      }
    }.getOrElse(Redirect(routes.Application.login())) 
  }

  def validateUserHost = Action { implicit request =>
    val postvals = request.body.asFormUrlEncoded
    postvals.map { args =>
      val username = args("txtUsernameHost").head
      if (ApplicationModel.verifyUser("", username)) {
        Ok(views.html.waitingroom())
        .withSession("username" -> username, "code" -> "", "state" -> "host", "csrfToken" -> play.filters.csrf.CSRF.getToken.get.value)
      } else {
        Redirect(routes.Application.login()).flashing("error" -> "Could not verify username.")
      }
    }.getOrElse(Redirect(routes.Application.login())) 
  }

  def startGame = Action { implicit request =>
    Ok(views.html.waitingroom())
  }

  def getUsername = Action { implicit request =>
    val usernameOption = request.session.get("username")
    val username = usernameOption.getOrElse("")
    Ok(username)
  }

}
