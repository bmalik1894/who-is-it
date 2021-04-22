package actors

import akka.actor.Actor
import akka.actor.Props
import akka.actor.ActorRef
import collection.mutable
import scala.util.Random
import GameActor._

class GamesManager extends Actor {
    import GamesManager._
    private var pals = List.empty[ActorRef]
    private var games = mutable.Map.empty[String, ActorRef]
    val ran = new Random
   

    def receive = {
        case NewPal(p) => pals ::= p
        case NewGame(host,name) =>val s = generateCode()
                             val newGame = new GameActor(s)
                            // games(s) = newGame
                            // newGame ! GameActor.AddPal(host,name)
        case JoinGame(pal,name,code) => games(code) ! GameActor.AddPal(pal,name)
        case m => println("Unhandled message in GamesManager: "+m)
    }
    def generateCode(): String = {
        //val code = (100000 + ran.nextInt(900000)).toString()
          val code = "123456"
          code
    }
}
object GamesManager{
    case class NewPal(pal: ActorRef)
    case class NewGame(host: ActorRef,name: String)
    case class JoinGame(pal: ActorRef,name: String, code: String)
}