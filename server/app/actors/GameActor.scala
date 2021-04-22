package actors

import akka.actor.Actor
import akka.actor.Props
import akka.actor.ActorRef
import collection.mutable

class GameActor(code:String) extends Actor {
    private var players = List.empty[ActorRef]
    private var names = mutable.Map.empty[ActorRef,String]
    import GameActor._
    def receive = {
        case AddPal(pal,name) => players ::= pal
                                 names(pal) = name
        case m => println("Unhandled message in gameActor: "+m)
    }
}

object GameActor{
    case class AddPal(pal: ActorRef, name: String)
}