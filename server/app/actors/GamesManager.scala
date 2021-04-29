package actors

import akka.actor.Actor
import akka.actor.Props
import akka.actor.ActorRef
import akka.actor.ActorSystem
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
        case NewGame(host,name) => {val s = generateCode()
                                   val newGame = context.actorOf(Props(new GameActor(s, self, host, name))) 
                                    }
        case GameMade(nGame,nCode) => games(nCode) = nGame
        case JoinGame(pal,name,code) => if(games.contains(code)){
                                            games(code) ! GameActor.AddPal(pal,name)
                                        }else{
                                            games.foreach(x => println("good code:"+x))
                                            println("failed code:"+code)
                                            println("name:"+name)
                                             pal ! PlayerActor.JoinFailed()
                                             }
        case m => println("Unhandled message in GamesManager: "+m)
    }
    def generateCode(): String = {
          val code = util.Random.alphanumeric.take(6).mkString
          if (games.keySet.contains(code)) generateCode()
          else code
    }
}
object GamesManager{
    case class NewPal(pal: ActorRef)
    case class NewGame(host: ActorRef,name: String)
    case class JoinGame(pal: ActorRef,name: String, code: String)
    case class GameMade(game: ActorRef, code:String)
   
}