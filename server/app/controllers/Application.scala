package controllers

import javax.inject._


import shared.SharedMessages
import play.api.mvc._
import play.api.i18n._
import play.api.data._
import play.api.libs.json
import play.api.libs.json._

@Singleton
class Application @Inject()(cc: ControllerComponents) extends AbstractController(cc) {

  def login = Action { implicit request =>
    Ok(views.html.login())
  }

  def validateUser = Action { implicit request =>
    //request.get
    //if 
    //Ok(true)
    
    Ok("placeholder")

  }

}
