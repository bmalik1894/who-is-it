package actors

import akka.actor.Actor
import akka.actor.Props
import akka.actor.ActorRef
import collection.mutable

class GameActor(code:String,manager: ActorRef, host:ActorRef, hostName: String) extends Actor {
    private var players = List.empty[ActorRef]
    private var names = mutable.Map.empty[ActorRef,String]
    players ::= host
    names(host) = hostName
    manager ! GamesManager.GameMade(self,code)
    host ! PlayerActor.GameCreated(self,code)
    import GameActor._
    def receive = {
        case AddPal(pal,name) => players ::= pal
                                 names(pal) = name
                                 pal ! PlayerActor.GameAdded(self)
        case m => println("Unhandled message in gameActor: "+m)
    }
}

object GameActor{
    case class AddPal(pal: ActorRef, name: String)
}