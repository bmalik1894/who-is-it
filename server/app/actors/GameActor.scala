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
    private var mostPopular = mutable.Map.empty[String,Int]
    private var quickest = mutable.Map.empty[String,Int]
    private var rounds = 4
    private var maxRounds = 4
    private var questions = List.empty[String] //temporary holding questioins
    players ::= host
    private var ready = 0
    private var submited = 0
    private var started = false
    private var questionActive = false
    names(host) = hostName
    pics(host) = "00"
    manager ! GamesManager.GameMade(self,code)
    //println("Making a game its been made Weird huh?")
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
        case ChangeRounds(n) => println("Rounds changed to "+n)
                                maxRounds = n
                                rounds = n
        case ChoosePic(pal,pic) => if(pics.contains(pal)){
                                        pics(pal) = pic
                                    }
        case Ready() => ready += 1
                        if(ready == players.length){
                            started = true
                            startGame()
                        }
        case NextR() => if(questionActive != true){ready += 1}
                        if(ready == players.length){
                            playRound()
                        }
        case HostNextR() => playRound()
        case HostReady() => started = true
                            startGame()
        case NewQ(q) => questions ::= q
                        //println("adding:"+q)
                        host ! QuestionAdded(q)
        case ChatMessage(sender,recie,mess) => println(mess)
        case GimmeQuestion() =>  playRound()
        case Response(sender,choice,time) => enterResponse(sender,choice,time)
        case StartAgain() => rounds = maxRounds
                             playRound()
        case m => println("Unhandled message in gameActor: "+m)
    }

    def playRound(): Unit = {
        if (questions.length > 0) {
            var rQuestion = ""
            if(questions.length == 1){
                  rQuestion = questions(0)
                  questions = List()
            }else{
                 rQuestion = questions(rand.nextInt(questions.length - 1))
                questions = questions.filterNot(q => q == rQuestion)
            }
            // println("Q removed from "+ questions.foreach(x => print(x + ", ")))
        
            players.foreach(x => x ! PlayerActor.RoundQuestion(rQuestion))
            names.values.foreach(x => choices(x) = 0)
            ready = 0
            submited = 0
            questionActive = true;
        } else {
            val pop = mostPopular.maxBy(_._2)._1
            val leastPop = mostPopular.minBy(_._2)._1
            val quick = quickest.maxBy(_._2)._1
            players.foreach(x => x ! PlayerActor.EndGame(pop,leastPop,quick))
        }
    }

    def startGame():Unit = {
        players.foreach(x => x ! PlayerActor.GameStarted())
        names.values.foreach(x => mostPopular(x) = 0)
        names.values.foreach(x => quickest(x) = 0)
    }
    def enterResponse(sender: ActorRef, choice: String, time: Double): Unit = {
        if(questionActive){
            if(choice != "NoChoice"){
                if(submited == 0){
                    val n = names(sender)
                    quickest(n) += 1 
                }
                mostPopular(choice) += 1
                choices(choice) += 1
                submited += 1
            }
            if(submited == players.length){
                endRound()
            }
        }
    }
    def endRound():Unit={
        println("we have "+rounds + "rounds left!")
        val max = choices.maxBy(_._2)._1
        players.foreach(x => x ! PlayerActor.Winner(max))
        rounds -= 1
        questionActive = false
        if(rounds <= 0){
            println("ran out of rounds!")
            val pop = mostPopular.maxBy(_._2)._1
            val leastPop = mostPopular.minBy(_._2)._1
            val quick = quickest.maxBy(_._2)._1
            players.foreach(x => x ! PlayerActor.EndGame(pop,leastPop,quick))
        }
        //Thread.sleep(30000)
        //if(rounds > 0){
        //    playRound()
        //}else{
        //    println("GAMEDONE")
        //}
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
    case class NextR()
    case class HostNextR()
    case class StartAgain()
}