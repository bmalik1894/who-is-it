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

import play.api.db.slick.DatabaseConfigProvider
import slick.jdbc.JdbcProfile
import slick.jdbc.PostgresProfile.api._
import scala.concurrent.ExecutionContext
import play.api.db.slick.HasDatabaseConfigProvider
import models.DatabaseModel

@Singleton
class WebSocketApp @Inject()(protected val dbConfigProvider: DatabaseConfigProvider, cc: ControllerComponents)(implicit system: ActorSystem, mat:Materializer, ec: ExecutionContext) 
    extends AbstractController(cc) with HasDatabaseConfigProvider[JdbcProfile] { 
    
    val model = new DatabaseModel(db)
    val manager = system.actorOf(Props(new GamesManager(model)), "Manager")

    
    def socket = WebSocket.accept[String,String] { request =>
        ActorFlow.actorRef { out =>
            PlayerActor.props(out, manager)
        }
    }
}