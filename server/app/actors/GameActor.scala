package actors

import akka.actor.Actor
import akka.actor.Props
import akka.actor.ActorRef
import collection.mutable
import models.Player
import scala.util.Random
import controllers.Application
import models.DatabaseModel
import scala.concurrent.ExecutionContext


class GameActor(code: String,manager: ActorRef, host:ActorRef, hostName: String, hostPic: String, dbModel:DatabaseModel)(implicit ec: ExecutionContext) extends Actor {
    val rand = Random
    private val gameCode = code
    private var players = List.empty[ActorRef]
    private var names = mutable.Map.empty[ActorRef,String]
    private var pics = mutable.Map.empty[ActorRef,String]
    private var choices = mutable.Map.empty[String,Int]
    private var mostPopular = mutable.Map.empty[String,Int]
    private var quickest = mutable.Map.empty[String,Int]


    private var rounds = 12
    private var maxRounds = 12
    private var timer = 60.0
    private var questions = List.empty[String] //temporary holding questioins
   
    private var ready = 0
    private var submited = 0
    private var started = false
    private var questionActive = false

    private val nonAns = "Nobody Answered :("
    //add the Host
    println("HOSTNAME " + hostName)
    players ::= host
    names(host) = hostName
    pics(host) = hostPic
    manager ! GamesManager.GameMade(self,code)
    host ! PlayerActor.GameCreated(self,code)
    host !  PlayerActor.NewU(hostName,pics(host))
    import GameActor._
    def receive = {
        case AddPal(pal,name,nPic) => players ::= pal
                                        println(name)
                                      names(pal) = name
                                      pics(pal) = nPic
                                      pal ! PlayerActor.GameAdded(self)
                                      pal ! PlayerActor.CurrentUsers(players.map(x => (names(x),pics(x))))
                                      players.foreach(x => x ! PlayerActor.NewU(name,nPic))
        case ChangeRounds(n) => maxRounds = n
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
                        host ! QuestionAdded(q)
        case ChatMessage(sender,recie,mess) => println(mess)
        case GimmeQuestion() =>  playRound()
        case Response(sender,choice,time) => enterResponse(sender,choice,time)
        case NoResponse(sender) => enterResponse(sender, nonAns,0.0)
        case StartAgain() => rounds = maxRounds
                             reStartGame();
        case UpvoteQ(q) => upVinDB(q)
        case DownvoteQ(q) => downVinDB(q)
        case ChangeTime(newtTime) => timer = newtTime
        case m => println("Unhandled message in gameActor: "+m)
    }
    //This chooses a question and sends it out to all the players. If there are no questions to ask, it ends the game early
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
        
            names.values.foreach(x => choices(x) = 0)
            choices(nonAns) = 0
            ready = 0
            submited = 0
            questionActive = true;
            players.foreach(x => x ! PlayerActor.RoundQuestion(rQuestion))
        } else {
            val pop = mostPopular.maxBy(_._2)._1
            val leastPop = mostPopular.minBy(_._2)._1
            val quick = quickest.maxBy(_._2)._1
            players.foreach(x => x ! PlayerActor.EndGame(pop,leastPop,quick))
        }
    }
    //starts the game. It sets all the quickest and most popular counts to 0 and if it needs more questions it requests them from the database
    //It also adds the current game with its questions to the database
    def startGame():Unit = {
        names.values.foreach(x => mostPopular(x) = 0)
        mostPopular(nonAns) = 0
        names.values.foreach(x => quickest(x) = 0)
        var numQ = maxRounds - questions.length
        questions.foreach(x => enterQtoDB(x))
        dbModel.getQuestions(numQ, None).foreach(x => x.foreach(k => addQuestion(k)))
        dbModel.addGame(gameCode,maxRounds)
        players.foreach(x => x ! PlayerActor.GameStarted(timer))
    }
    def addQuestion(question: String): Unit ={
        questions ::= question;
    }
    //restarts the game with the settings and questions it already had. 
    def reStartGame(): Unit = {
        names.values.foreach(x => mostPopular(x) = 0)
        mostPopular(nonAns) = 0
        names.values.foreach(x => quickest(x) = 0)
        dbModel.getQuestions(maxRounds,Some(code)).foreach(x => x.foreach(k => addQuestion(k)))
        playRound();
    }
    def enterQtoDB(question: String):Unit ={
        dbModel.addUserQuestion(question, gameCode)
    }
    def upVinDB(question: String):Unit = {

    }
    def downVinDB(question: String):Unit = {

    }
    //receives a response from a player and increases the count for their choice
    //It checks if it has seen a response from each player and ends the round if it has
    def enterResponse(sender: ActorRef, choice: String, time: Double): Unit = {
        println("entereing Response")
        if(questionActive){
            if(choice != nonAns){
                if(submited == 0){
                    val n = names(sender)
                    quickest(n) += 1 
                }
                mostPopular(choice) += 1
                choices(choice) += 1
            }
            submited += 1
            if(submited == players.length){
                endRound()
            }
        }
    }
    //Ends a round. It finds the "winner" who got the most votes. 
    //It sends everyone the winner, decreases the number of rounds, and checks to see if the game is over.
    //If there are no more rounds it finds the superlatives and sends out the end of game message
    def endRound():Unit={
        val max = choices.maxBy(_._2)._1
        if(choices(max) == 0){
            players.foreach(x => x ! PlayerActor.Winner(nonAns))
        }else{
            players.foreach(x => x ! PlayerActor.Winner(max))
        }
        rounds -= 1
        questionActive = false
        if(rounds <= 0){
            val pop = mostPopular.maxBy(_._2)._1
            val leastPop = mostPopular.filter(x => x._1 != nonAns).minBy(_._2)._1
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
    case class NoResponse(sender: ActorRef)
    case class ChangeTime(time: Double)
}
