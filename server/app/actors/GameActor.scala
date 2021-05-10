package actors

import akka.actor.Actor
import akka.actor.Props
import akka.actor.ActorRef
import collection.mutable
import models.Player
import scala.util.Random
import controllers.Application

class GameActor(code: String,manager: ActorRef, host:ActorRef, hostName: String, hostPic: String) extends Actor {
    val rand = Random
    private val GameCode = code
    private var players = List.empty[ActorRef]
    private var names = mutable.Map.empty[ActorRef,String]
    private var pics = mutable.Map.empty[ActorRef,String]
    private var choices = mutable.Map.empty[String,Int]
    private var mostPopular = mutable.Map.empty[String,Int]
    private var quickest = mutable.Map.empty[String,Int]
    private var rounds = 8
    private var maxRounds = 8
    private var questions = List.empty[String] //temporary holding questioins
    players ::= host
    private var ready = 0
    private var submited = 0
    private var started = false
    private var questionActive = false
    names(host) = hostName
    pics(host) = hostPic
    manager ! GamesManager.GameMade(self,code)
    //println("Making a game its been made Weird huh?")
    host ! PlayerActor.GameCreated(self,code)
    host !  PlayerActor.NewU(hostName,pics(host))
    import GameActor._
    def receive = {
        case AddPal(pal,name,nPic) => players ::= pal
                                 names(pal) = name
                                 pics(pal) = nPic
                                 pal ! PlayerActor.GameAdded(self)
                                 pal ! PlayerActor.CurrentUsers(players.map(x => (names(x),pics(x))))
                                 players.foreach(x => x ! PlayerActor.NewU(name,nPic))
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
                             reStartGame();
        case UpvoteQ(q) => upVinDB(q)
        case DownvoteQ(q) => downVinDB(q)
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
        names.values.foreach(x => mostPopular(x) = 0)
        names.values.foreach(x => quickest(x) = 0)
        var numQ = maxRounds - questions.length
        questions.foreach(x => enterQtoDB(x))
        // DatabaseModel.getQuestions(numQ)
        //DatabaseModel.addGame(GameCode,MaxRounds)
        players.foreach(x => x ! PlayerActor.GameStarted())
    }
    def reStartGame(): Unit = {
        names.values.foreach(x => mostPopular(x) = 0)
        names.values.foreach(x => quickest(x) = 0)
        //DatabaseModel.getQuestions(maxRounds,code)
        playRound();
    }
    def enterQtoDB(question: String):Unit ={
       // DatabaseModel.addUserQuestion(question, gameCode)
    }
    def upVinDB(question: String):Unit = {

    }
    def downVinDB(question: String):Unit = {

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
    }
}

object GameActor{
    case class AddPal(pal: ActorRef, name: String, pic: String)
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
    case class UpvoteQ(question: String)
    case class DownvoteQ(question: String)
}