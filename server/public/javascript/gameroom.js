"use strict"

// Creates websocket
const socketRoute = document.getElementById("ws-route").value;
let websock = (location.protocol == "https:") ? socketRoute.replace("http","wss") : socketRoute.replace("http", "ws");
const socket = new WebSocket(websock);

// Collectiosn some info that is passed through controller
let currUser = document.getElementById("usernameInput").value;
currUser = currUser.substring(1, currUser.length - 1)
let gameCode = document.getElementById("stateInput").value;
let isHost = false;
document.getElementById("room-code").innerHTML = "Game Code: " + gameCode; 
const song = new Audio("/versionedAssets/music/macintosh.mp3");


// React create element and local datalists outside react
const ce = React.createElement;
let questionList = [];
let qsonBoard = [];
let userList = [];
let usonBoard = [];
let currentQuestion = "";
let winner = "";
let finalWinner = "";
let finalloser = "";
let quickdraw = "";
let firstRound = true;
let numRounds = 4;


// Opens socket through either host or player route
if (gameCode == 'host') {
    isHost = true;
    socket.onopen = (event) => socket.send("NEWGAME," + currUser);
} else {
    gameCode = gameCode.substring(1, gameCode.length - 1);
    document.getElementById("room-code").innerHTML = "Game Code: " + gameCode; 
    socket.onopen = (event) => socket.send("JOIN," + gameCode + ',' + currUser);
}

// MessageHandler Function - does bulk of the work
socket.onmessage = (event) => handleMessage(event.data)
function handleMessage(data) {
    console.log(data);
    if (data.includes("NEWGAMECODE,")) { // Recieve Code 
        gameCode = data.replace("NEWGAMECODE,","");
        document.getElementById("room-code").innerHTML = "Game Code: " + gameCode; 
    } else if (data.includes("NEWQ")) { // Recieve new Question
        questionList.push(data.replace("NEWQ,",""));
        populateQuestions();
    } else if (data.includes("NEWU,")) { // Recieve new User
        userList.push(data.replace("NEWU,",""))
        populateUsers();
    } else if (data == "STARTGAME") {
        ReactDOM.render(
            ce(MainComponent, null, null), 
            document.getElementById('mainroomdiv')
        );
    } else if (data.includes("ROUND,")) {
        if (currentQuestion == "") {
            currentQuestion = data.replace("ROUND,","");
            if(document.getElementById("currQuestion") != null) {
                document.getElementById("currQuestion").innerHTML = currentQuestion;
            }
        } else {
            currentQuestion = data.replace("ROUND,","");
            if(document.getElementById("currQuestion") != null) {
                document.getElementById("currQuestion").innerHTML = currentQuestion;
            }
            ReactDOM.render(
                ce(MainComponent, null, null), 
                document.getElementById('mainroomdiv')
            );
        }

    } else if (data.includes("WINNER,")) {
        winner = data.replace("WINNER,", "");
        ReactDOM.render(
            ce(RoundComponent, null, null),
            document.getElementById("mainroomdiv")
        )
    } else if (data.includes("GAMEOVER,")) {
        let superlatives = data.split(",");
        finalWinner = superlatives[1];
        finalloser = superlatives[2];
        quickdraw = superlatives[3];
        ReactDOM.render(
            ce(GameOverComponent, null, null),
            document.getElementById("mainroomdiv")
        )
    }
}

// Populate Questions
function populateQuestions() {
    let qdiv = document.getElementById("questiondiv");
    for (const question of questionList) {
        if (!qsonBoard.includes(question)) {
            let questp = document.createElement("p");
            questp.innerHTML = question;
            qdiv.appendChild(questp);
            qsonBoard.push(question);
        }
    }
}

// Populate Users
function populateUsers() {
    let udiv = document.getElementById("userdiv");
    for (const user of userList) {
        if (!usonBoard.includes(user)) {
            let userp = document.createElement("p");
            userp.innerHTML = user;
            udiv.appendChild(userp);
            usonBoard.push(user);
        }
    }
}

//React:
class HostWaitingRoom extends React.Component { ///////////////////////// HOST WAITING ROOM //////////////////////////////
    constructor(props) {
        super(props)
        this.state = {
            roundNumber: "4",
            questions: [],
            newQuestion: "",
            userName: currUser,
            picId: -1,
            timerLength: 60,
            errorMessage: ""
        }
    }

    render() {
        return ce('div', {id:"waiting-div"} ,
            ce("h2", {}, "Welcome to the Waiting Room, " + this.state.userName + "!"),
            ce('p', {}, "Number of Rounds: "),
            ce('input', {type:'range', min:2, max:8, defaultValue:4, onChange: e => this.sendRoundAmount(e)}),
            ce('span', {}, this.state.roundNumber),
            ce('br'),
            ce('p', {}, "Round time: "),
            ce('input', {type:'number', min:5, max:120, defaultValue:60, onChange: e => this.setState({timerLength:e.target.value})}),
            ce('br'),
            ce('p', {}, "Submit a Question:"),
            ce('input', {type:'text', onChange: e => this.changeNewQuestion(e)}),
            ce('button', {onClick: e => this.sendQuestion(e)}, 'Send'),
            ce('br'),
            ce('p', {}, "Add Question From Database:"),
            ce("select", {id:"dbquestions", onClick: e => this.populateDBQuestions()}, ce("option", {}, "-- Select a Question --")),
            ce('button', {onClick: e => this.addDBQ()}, "Add"),
            ce('br'),
            ce('button', {class: "btn btn-primary", onClick: e => this.startGame(e)}, 'Ready Up'),
            ce('button', {class: "btn btn-primary", onClick: e => this.forceGame(e)}, 'Start Game'),
            ce('br'),
            "Users:",
            ce('div', {id:'userdiv'}),
            "Questions:",
            ce('div', {id:"questiondiv"}),
            
        )}

        addDBQ() {
            let newdbq = document.getElementById("dbquestions").value
            if (newdbq != "-- Select a Question --") {
                socket.send("ADDQ," + newdbq);
            }
        }

        populateDBQuestions() {
            let allquestions = []
            //fetch(listDBQRoute.value).then(res => res.json()).then(dbqs => allquestions = dbqs);
            let questiondropdown = document.getElementById("dbquestions");
            var index = 0;
            for (var dbq of allquestions) {
            if (questiondropdown.innerHTML.indexOf('value="' +  + '"') == -1) {
                let newopt = document.createElement("option");
                newopt.value = dbq;
                newopt.text = dbq;
                userdropdown.add(newopt, userdropdown[index]);
                index++;
                }
            }
        }

        sendRoundAmount(e) {
            this.setState({roundNumber:e.target.value});
            socket.send("ROUNDS," + e.target.value)
            console.log("Rounds = " + e.target.value)
            numRounds = this.state.timerLength;

        }

        changeNewQuestion(data) {
            this.setState({newQuestion: data.target.value});
        }

        sendQuestion() {
            const quest = this.state.newQuestion;
            console.log(quest)
            socket.send("ADDQ," + quest);
            this.setState({newQuestion:""})
        }

        startGame() {
            socket.send("READY");
        }

        forceGame() {
            socket.send("HOSTREADY");
        }
}

class PlayerWaitingRoom extends React.Component { ///////////////////////////////// PLAYER WAITING ROOM //////////////////////////////
    constructor(props) {
        super(props)
        this.state = {
            userName: currUser,
            picId: -1,
            errorMessage: ""
        }
    }

    render() {
        return ce('div', {id:"waiting-div"} ,
            ce("h2", {}, "Welcome to the Waiting Room, " + this.state.userName + "!"),
            ce('br'),
            ce('p', {}, "Submit a Question:"),
            ce('input', {type:'text', onChange: e => this.changeNewQuestion(e)}),
            ce('button', {onClick: e => this.sendQuestion(e)}, 'Send'),
            ce('br'),
            ce('button', {onClick: e => this.startGame(e)}, 'Ready Up'),
            ce('div', {id:"questiondiv", onClick: e => this.refreshQuestions()}),
            ce('br'),
            "Users:",
            ce('div', {id:'userdiv', onClick: e => this.refreshUsers()}),
            
    )}

    changeNewQuestion(data) {
        this.setState({newQuestion: data.target.value});
    }

    sendQuestion() {
        const quest = this.state.newQuestion;
        console.log(quest)
        socket.send("ADDQ," + quest);
        this.setState({newQuestion:""})
    }

    refreshQuestions() {
        populateQuestions();
        this.setState({questions:questionList});
    }

    startGame() {
        socket.send("READY");
    }

    refreshUsers() {
        populateUsers();
        this.setState({users:userList});
    }

}


class MainComponent extends React.Component { ///////////////////////////////////////////// MAIN GAME ///////////////////////////////////////////////
    constructor(props) {
      super(props);
      this.state = { 
        GameMessage: "", 
        questionMessage: "", 
        action: "", 
        rounds: 4
        };
      }

      render(){
          if(this.state.rounds != 0)
            return ce(DisplayGameComponent)
          else
            return ce(GameOverComponent)

      }
}
class DisplayGameComponent extends React.Component {
    constructor(props) {
      super(props); // all the data necessary for creating a game will be defined here
      this.state = {
        players: usonBoard, 
        gameCode: "",
        questions: qsonBoard,
        currQuestion: "",
        round: 1,
        errorMessage: ""
      };
    }

    componentDidMount() {
        if (firstRound) {
        this.grabQuestion();
        }
        this.addAnswers();
    }

    render() {
        return ce('div', {},
            ce("h3", null, "Round: " + this.state.round),
            ce('br'),
            ce('h3',{id:"currQuestion"}, this.state.currQuestion),
            ce('div', {id:'playerdiv'}, ""),
            );
    }

    grabQuestion() {
        if (isHost) {
        socket.send("STARTROUND");
        }
        this.setState({currQuestion:currentQuestion})
    }

    addAnswers() {
        let udiv = document.getElementById("playerdiv");    
        let index = 1;
        for (const player of this.state.players) {
            let playeranswer = document.createElement('p');
            playeranswer.innerHTML = index + '. ' + player;
            playeranswer.onmousedown = function() {
                socket.send("ANSWER," + player);
                this.style.fontWeight = "bold";
                Array(udiv.children).map(x => x.onmousedown = null);
                }
            udiv.appendChild(playeranswer);
            index++;
        }
        this.setState({currQuestion:currentQuestion});
    }
    

}

class RoundComponent extends React.Component { ////////////////////////////// ROUND OVER ////////////////////////////////////////
    constructor(props) {
        super(props);
        this.state = {
            whowon: ""
        }
    }

    componentDidMount() {
        this.setState({whowon:winner})
        firstRound = false;
    }
    render() {

        if (isHost) {
        return ce('div', {id:"NextRoundDiv"},
            ce("h3", {}, "ROUND OVER"),
            ce("p", {}, "Winner:" + this.state.whowon),
            ce("button", { id:"NextButton", onClick: e => this.goToNextRound()}, "Next Round"),
            ce("button", { id:"HostNextButton", onClick: e => this.hostToNextRound()}, "Force Next Round")
            );
        j} else {
            return ce('div', {id:"NextRoundDiv"},
            ce("h3", {}, "ROUND OVER"),
            ce("p", {}, "Winner:" + this.state.whowon),
            ce("button", { id:"NextButton", onClick: e => this.goToNextRound()}, "Next Round"),
            );
        }
    }

    goToNextRound() {
        socket.send("NEXTROUND");
        document.getElementById("NextButton").onClick = null;
    }

    hostToNextRound() {
        socket.send("HOSTNEXTROUND");
        document.getElementById("NextButton").onClick = null;
        document.getElementById("HostNextButton").onClick = null;
    }
    
}

class GameOverComponent extends React.Component { ///////////////////////////// GAME OVER /////////////////////////////////
    constructor(props) {
        super(props);
        this.state = {
            mostpopular: "",
            fastest: "",
            leastpopular: ""
        }
    }

    componentDidMount() {
        this.setState({mostpopular:finalWinner, leastpopular:finalloser, fastest:quickdraw})
    }

    render() {
        return ce('div', {id:'gameoverdiv'},
        ce('h3', {}, "GAME OVER"),
        ce('p', {}, "Most Popular Player: " + this.state.mostpopular),
        ce('p', {}, "Least Popular Player: " + this.state.leastpopular),
        ce('p', {}, "Quickest Player: " + this.state.fastest)
        )
    }
}


// Enter waiting room based on if you are a host or not
if (isHost) {
    ReactDOM.render(
        ce(HostWaitingRoom, null, null), 
        document.getElementById('mainroomdiv')
        );
} else {
    ReactDOM.render(
        ce(PlayerWaitingRoom, null, null), 
        document.getElementById('mainroomdiv')
        );
}