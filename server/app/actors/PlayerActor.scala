package actors

import akka.actor.Actor
import akka.actor.Props
import akka.actor.ActorRef
import collection.mutable

class PlayerActor(out: ActorRef, manager: ActorRef, name: String) extends Actor{
    manager ! GamesManager.NewPal(self)
    val userName = name
    private var waiting = true;
    private var myGame = self
    import PlayerActor._
    def receive = {
        case s:String => if(s == "NEWGAME"){
                            manager ! GamesManager.NewGame(self,userName)
                         }else if (s.contains("JOIN")){
                             val code = s.substring(s.indexOf(",")+1)
                             manager ! GamesManager.JoinGame(self,userName,code)
                         }
        case GameCreated(game,code) => myGame = game
                                        out ! "NEWGAMECODE," + code
        case GameAdded(game) => myGame = game
                                out ! "WAITINGROOM"
        case m => println("Unhandled message in PlayerActor: "+m)
    }
}
object PlayerActor{
   case class GameCreated(game:ActorRef,code:String)
   case class GameAdded(game:ActorRef)
}