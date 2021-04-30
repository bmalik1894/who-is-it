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

// React create element and local datalists outside react
const ce = React.createElement;
let questionList = []
let qsonBoard = []
let userList = []
let usonBoard = []

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
            userp.innerHTML = question;
            udiv.appendChild(questp);
            usonBoard.push(question);
        }
    }
}

//React:
class HostWaitingRoom extends React.Component { // HOST WAITING ROOM
    constructor(props) {
        super(props)
        this.state = {
            numRounds: 4,
            questions: [],
            newQuestion: "",
            userName: currUser,
            picId: -1,
            timerLength: 60,
            errorMessage: ""
        }
    }

    componentDidMount() {
        this.refreshQuestions();
    }

    render() {
        return ce('div', {id:"waiting-div"} ,
            ce("h2", {}, "Welcome to the Waiting Room, " + this.state.userName + "!"),
            ce('p', {}, "Number of Rounds: "),
            ce('input', {type:'range', min:2, max:8, defaultValue:4, onChange: e => this.setState({numRounds:e})}),
            ce('span', {value:this.state.numRounds}),
            ce('br'),
            ce('p', {}, "Round time: "),
            ce('input', {type:'number', min:5, max:120, defaultValue:60, onChange: e => this.setState({timerLength:e})}),
            ce('br'),
            ce('p', {}, "Submit a Question:"),
            ce('input', {type:'text', onChange: e => this.changeNewQuestion(e)}),
            ce('button', {onClick: e => this.sendQuestion(e)}, 'Send'),
            ce('br'),
            ce('button', {onClick: e => this.startGame(e)}, 'Ready Up'),
            ce('button', {onClick: e => this.forceGame(e)}, 'Start Game'),
            ce('div', {id:'userdiv', onClick: e => this.refreshUsers()}),
            ce('div', {id:"questiondiv", onClick: e => this.refreshQuestions()})
        )}

        changeNewQuestion(data) {
            this.setState({newQuestion: data.target.value});
        }

        sendQuestion() {
            const quest = this.state.newQuestion;
            console.log(quest)
            socket.send("ADDQ," + quest);
        }

        refreshQuestions() {
            populateQuestions();
            this.setState({questions:questionList});
        }

        refreshUsers() {
            populateUsers();
            this.setState({users:userlist});
        }

        startGame() {
            socket.send("READY");
        }

        forceGame() {
            socket.send("HOSTREADY");
        }
}

class PlayerWaitingRoom extends React.Component { // PLAYER WAITING ROOM
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
            ce('div', {id:"questiondiv", onClick: e => this.refreshQuestions()})
    )}

    changeNewQuestion(data) {
        this.setState({newQuestion: data.target.value});
    }

    sendQuestion() {
        const quest = this.state.newQuestion;
        console.log(quest)
        socket.send("ADDQ," + quest);
    }

    refreshQuestions() {
        populateQuestions();
        this.setState({questions:questionList});
    }

    startGame() {
        socket.send("READY");
    }
}


class MainComponent extends React.Component { // MAIN GAME
    constructor(props) {
      super(props);
      this.state = { GameMessage: "", questionMessage: "", action: "", rounds: Int};
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
        players: [], 
        gameCode: "",
        questions: [],
        errorMessage: ""
      };
    }
    render() {
        return ce('div', {},
            ce("h3", null, "Round: "),
            ce('br'),
            ce('input', {type: "text", id: "txtUsernameHost", value: this.state.userName, onChange: e => this.changeUsername(e)}),
            ce('button', {type: 'submit', id: "submitButtonHost", onClick: e => this.handleSubmit(e), value:"Submit"}, "Submit"),
            ce('br'),
            ce('button', {id: "goBackButtonJoin", onClick: e => this.goBack(e), value:"Go Back"}, "Go Back")
            );
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