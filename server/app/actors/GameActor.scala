package actors

import akka.actor.Actor
import akka.actor.Props
import akka.actor.ActorRef
import collection.mutable
import models.Player

class GameActor(code:String,manager: ActorRef, host:ActorRef, hostName: String) extends Actor {
    private var players = List.empty[ActorRef]
    private var names = mutable.Map.empty[ActorRef,String]
    private var pics = mutable.Map.empty[ActorRef,String]
    private var rounds = 4
    private var questions = List.empty[String] //temporary holding questioins
    players ::= host
    private var ready = 0
    private var started = false
    names(host) = hostName
    pics(host) = "00"
    manager ! GamesManager.GameMade(self,code)
    host ! PlayerActor.GameCreated(self,code)
    import GameActor._
    def receive = {
        case AddPal(pal,name) => players ::= pal
                                 names(pal) = name
                                 pics(pal) = "00"
                                 pal ! PlayerActor.GameAdded(self)
        case ChangeRounds(n) => rounds = n
        case ChoosePic(pal,pic) => if(pics.contains(pal)){
                                        pics(pal) = pic
                                    }
        case Ready() => ready += 1
                        if(ready == players.length){
                            started = true
                            players.foreach(x => x ! PlayerActor.Starting())
                        }
        case HostReady() => started = true
        case NewQ(q) => questions ::= q
                        println("adding:"+q)
                        host ! QuestionAdded(q)
        case ChatMessage(sender,recie,mess) => println(mess)
        case GimmeQuestion() => playRound()
        case m => println("Unhandled message in gameActor: "+m)
    }

    def playRound(): Unit = {
        val rQuestion = "Who is most likely to use a placeholder question?"
        players.foreach(x => x ! PlayerActor.RoundQuestion(rQuestion))
    }
}

object GameActor{
    case class AddPal(pal: ActorRef, name: String)
    case class ChoosePic(pal: ActorRef, pic: String)
    case class ChangeRounds(newRounds: Int)
    case class GimmeQuestion()
    case class Ready()
    case class HostReady()
    case class QuestionAdded(question: String)
    case class NewQ(question: String)
    case class response(sender: ActorRef,choice: String,time: Double)
    case class ChatMessage(sender: String,recie: String, message: String)
}