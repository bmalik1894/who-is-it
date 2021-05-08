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
    private var timer = 0.0;
    private var picID = "00"
    import PlayerActor._
    def receive = {
        case s:String => 
            if(s.contains("NEWGAME")){ //NEWGAME,username
                userName = s.substring(s.indexOf(",")+1)
                manager ! GamesManager.NewGame(self,userName)
            } else if (s.contains("JOIN")){ //JOIN,code,username
                userName = s.split(",")(2)
                val code = s.split(",")(1)
                manager ! GamesManager.JoinGame(self,userName,code)
            } else if (s.contains("PIC")){ //PIC,picID
                val picID = s.split(",")(1)
                myGame ! GameActor.ChoosePic(self,picID)
            } else if (s.contains("ROUNDS")){ //ROUNDS,roundsnum
                val newRounds = s.split(",")(1)
                myGame ! GameActor.ChangeRounds(newRounds.toInt)
            } else if (s == "READY"){ //READY
                myGame ! GameActor.Ready()
            } else if (s == "HOSTREADY"){ //HOSTREADY      (this overides wveryone else and starts the game)
                myGame ! GameActor.HostReady()
            } else if (s.contains("ADDQ")){ //ADDQ,question
              //  println("NewQ got:"+s)
                val quest = s.split(",")(1)
                myGame ! GameActor.NewQ(quest)
            } else if (s.contains("CHAT")){ //CHAT,sender,recipient,message
                val sender = s.split(",")(1)
                val recie = s.split(",")(2)
                val mess = s.split(",")(3)
                myGame ! GameActor.ChatMessage(sender,recie,mess)
            } else if (s.contains("ANSWER")){
                val ans = s.split(",")(1)
                myGame ! GameActor.Response(self,ans,0.0)
            } else if (s == "STARTROUND"){
                myGame ! GameActor.GimmeQuestion()
            } else if (s == "NEXTROUND"){
                myGame ! GameActor.NextR()
            } else if (s == "HOSTNEXTROUND"){
                myGame ! GameActor.HostNextR()
            }
        case GameCreated(game,code) => myGame = game
                                        out ! "NEWGAMECODE," + code
        case GameAdded(game) => myGame = game
                                out ! "CONNECTED"
        case GameActor.QuestionAdded(q) => out ! "NEWQ,"+q 
        case JoinFailed => out ! "BADCODE"
        case RoundQuestion(q) =>  timer = 0.0 // NEWQ,question/name+pic/name+pic
                                           //var dummy = ""
                                           //answers.foreach(x => dummy += "/"+x._1 +"+" + x._2)
                                           out ! "ROUND,"+q 
        case GameStarted() => out ! "STARTGAME"
        case CurrentUsers(people) => {
                people.foreach(x => out ! "NEWU,"+x)
            }
        case NewU(u) => out ! "NEWU,"+u
        case Winner(u) => out ! "WINNER,"+u
        case EndGame(p,lp,q) => out ! "GAMEOVER,"+p+","+lp+","+q
        case m => println("Unhandled message in PlayerActor: "+m)
    }
}
object PlayerActor{
  def props(out: ActorRef, manager:ActorRef) = Props(new PlayerActor(out, manager))
   case class GameCreated(game:ActorRef,code:String)
   case class GameAdded(game:ActorRef)
   case class JoinFailed()
   case class RoundQuestion(quest:String)
   case class GameStarted()
   case class CurrentUsers(people: List[String])
   case class NewU(user:String)
   case class Winner(win:String)
   case class EndGame(pop:String,lPop:String,quick:String)
}