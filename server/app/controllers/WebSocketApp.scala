package controllers

import javax.inject._

import play.api.mvc._
import play.api.i18n._
import play.api.data._
import play.api.libs.json
import akka.actor.Actor
import play.api.libs.streams.ActorFlow
import akka.actor.ActorSystem
import akka.stream.Materializer
import akka.actor.Props
import actors._

@Singleton
class WebSocketApp @Inject()(cc: ControllerComponents)(implicit system: ActorSystem, mat:Materializer) extends AbstractController(cc) { 
    val manager = system.actorOf(Props[GamesManager], "Manager")

    
    def socket = WebSocket.accept[String,String] { request =>
        ActorFlow.actorRef { out =>
            PlayerActor.props(out, manager)
        }
    }
}