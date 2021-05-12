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
            if(s.contains("NEWGAME,")){ //NEWGAME,username
                val strings = s.split(",")
                val userName = strings(1)
                val pic = strings(2)
                manager ! GamesManager.NewGame(self,userName,pic)
            } else if (s.contains("JOIN,")){ //JOIN,code,username
                val strings = s.split(",")
                val code = strings(1)
                val userName = strings(2)
                val pic = strings(3)
                manager ! GamesManager.JoinGame(self,userName,code,pic)
            } else if (s.contains("PIC,")){ //PIC,picID
                val picID = s.split(",")(1)
                myGame ! GameActor.ChoosePic(self,picID)
            } else if (s.contains("ROUNDS,")){ //ROUNDS,roundsnum
                val newRounds = s.split(",")(1)
                myGame ! GameActor.ChangeRounds(newRounds.toInt)
            } else if (s == "READY"){ //READY
                myGame ! GameActor.Ready()
            } else if (s == "HOSTREADY"){ //HOSTREADY      (this overides wveryone else and starts the game)
                myGame ! GameActor.HostReady()
            } else if (s.contains("ADDQ,")){ //ADDQ,question
              //  println("NewQ got:"+s)
                val quest = s.split(",")(1)
                myGame ! GameActor.NewQ(quest)
            } else if(s == "NOANSWER"){ 
                println("got No Response!")
                myGame ! GameActor.NoResponse(self)
            }else if (s.contains("ANSWER,")){
                val ans = s.split(",")(1)
                myGame ! GameActor.Response(self,ans,0.0)
            }else if (s == "STARTROUND"){
                myGame ! GameActor.GimmeQuestion()
            } else if (s == "NEXTROUND"){
                myGame ! GameActor.NextR()
            } else if (s == "HOSTNEXTROUND"){
                myGame ! GameActor.HostNextR()
            }else if (s == "RESTART"){
                myGame ! GameActor.StartAgain()
            }else if (s.contains("TIMER,")){
                val time = s.split(",")(1)
                myGame ! GameActor.ChangeTime(time.toDouble)
            }
        case GameCreated(game,code) => myGame = game
                                        out ! "NEWGAMECODE," + code
        case GameAdded(game) => myGame = game
                                out ! "CONNECTED"
        case GameActor.QuestionAdded(q) => out ! "NEWQ,"+q 
        case JoinFailed() => out ! "BADCODE"
        case RoundQuestion(q) =>  timer = 0.0 // NEWQ,question/name+pic/name+pic
                                           //var dummy = ""
                                           //answers.foreach(x => dummy += "/"+x._1 +"+" + x._2)
                                           out ! "ROUND,"+q 
        case GameStarted(time) => out ! "STARTGAME," + time
        case CurrentUsers(people) => {
                people.foreach(x => out ! "NEWU,"+x._1+","+x._2)
            }
        case NewU(u,p) => out ! "NEWU,"+u+","+p
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
   case class GameStarted(time: Double)
   case class CurrentUsers(people: List[(String,String)])
   case class NewU(user:String,pic:String)
   case class Winner(win:String)
   case class EndGame(pop: String,lPop: String,quick: String)

}
