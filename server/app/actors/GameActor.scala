package actors

import akka.actor.Actor
import akka.actor.Props
import akka.actor.ActorRef
import collection.mutable
import models.Player
import scala.util.Random

class GameActor(code:String,manager: ActorRef, host:ActorRef, hostName: String) extends Actor {
    val rand = Random
    private var players = List.empty[ActorRef]
    private var names = mutable.Map.empty[ActorRef,String]
    private var pics = mutable.Map.empty[ActorRef,String]
    private var choices = mutable.Map.empty[String,Int]
    private var rounds = 4
    private var questions = List.empty[String] //temporary holding questioins
    players ::= host
    private var ready = 0
    private var started = false
    private var questionActive = false
    names(host) = hostName
    pics(host) = "00"
    manager ! GamesManager.GameMade(self,code)
    host ! PlayerActor.GameCreated(self,code)
    host !  PlayerActor.NewU(hostName)
    import GameActor._
    def receive = {
        case AddPal(pal,name) => players ::= pal
                                 names(pal) = name
                                 pics(pal) = "00"
                                 pal ! PlayerActor.GameAdded(self)
                                 pal ! PlayerActor.CurrentUsers(names.values.toList)
                                 players.foreach(x => x ! PlayerActor.NewU(name))
        case ChangeRounds(n) => rounds = n
        case ChoosePic(pal,pic) => if(pics.contains(pal)){
                                        pics(pal) = pic
                                    }
        case Ready() => ready += 1
                        if(ready == players.length){
                            started = true
                            startGame()
                        }
        case HostReady() => started = true
                            startGame()
        case NewQ(q) => questions ::= q
                        println("adding:"+q)
                        host ! QuestionAdded(q)
        case ChatMessage(sender,recie,mess) => println(mess)
        case GimmeQuestion() => playRound()
        case Response(sender,choice,time) => enterResponse(sender,choice,time)
        case m => println("Unhandled message in gameActor: "+m)
    }

    def playRound(): Unit = {
        if (questions.length != 0) {
        val rQuestion = questions(rand.nextInt(questions.length- 1))
        questions = questions.filterNot(q => q != rQuestion)
        
        players.foreach(x => x ! PlayerActor.RoundQuestion(rQuestion))
        names.values.foreach(x => choices(x) = 0)
        ready = 0
        questionActive = true;
        } else {
            // end the game
        }
    }

    def startGame():Unit = {
        players.foreach(x => x ! PlayerActor.GameStarted())
    }
    def enterResponse(sender: ActorRef, choice: String, time: Double): Unit = {
        if(questionActive){
            choices(choice) += 1
            ready += 1
            if(ready == players.length){
                endRound()
            }
        }
    }
    def endRound():Unit={
        val max = choices.maxBy(_._2)._1
        players.foreach(x => x ! PlayerActor.Winner(max))
        rounds -= 1
        Thread.sleep(30000)
        if(rounds > 0){
            playRound()
        }else{
            println("GAMEDONE")
        }
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
    case class Response(sender: ActorRef,choice: String,time: Double)
    case class ChatMessage(sender: String,recie: String, message: String)
}