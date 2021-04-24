package actors

import akka.actor.Actor
import akka.actor.Props
import akka.actor.ActorRef
import collection.mutable

class PlayerActor(out: ActorRef, manager: ActorRef) extends Actor{
    manager ! GamesManager.NewPal(self)
    private var userName = "PlaceHolder"
    private var waiting = true;
    private var myGame = self
    import PlayerActor._
    def receive = {
        case s:String => if(s.contains("NEWGAME")){
                            userName = s.substring(s.indexOf(",")+1)
                            manager ! GamesManager.NewGame(self,userName)
                         }else if (s.contains("JOIN")){
                             userName = s.split(",")(2)
                             val code = s.split(",")(1)
                             manager ! GamesManager.JoinGame(self,userName,code)
                         }
        case GameCreated(game,code) => myGame = game
                                        out ! "NEWGAMECODE," + code
        case GameAdded(game) => myGame = game
                                out ! "CONNECTED"
        case JoinFailed => out ! "BADCODE"
        case m => println("Unhandled message in PlayerActor: "+m)
    }
}
object PlayerActor{
  def props(out: ActorRef, manager:ActorRef) = Props(new PlayerActor(out, manager))
   case class GameCreated(game:ActorRef,code:String)
   case class GameAdded(game:ActorRef)
   case class JoinFailed()
}