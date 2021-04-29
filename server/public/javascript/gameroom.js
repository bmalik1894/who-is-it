
"use strict"

const socketRoute = document.getElementById("ws-route").value;
let websock = (location.protocol == "https:") ? socketRoute.replace("http","wss") : socketRoute.replace("http", "ws");
const socket = new WebSocket(websock);

let currUser = document.getElementById("usernameInput").value;
currUser = currUser.substring(1, currUser.length - 1)
let gameCode = document.getElementById("stateInput").value;
let isHost = false;
document.getElementById("room-code").innerHTML = "Game Code: " + gameCode; 

const ce = React.createElement;
let questionList = []
let qsonBoard = []
// Opens socket through either host or player route
if (gameCode == 'host') {
    isHost = true;
    socket.onopen = (event) => socket.send("NEWGAME," + currUser);
} else {
    gameCode = gameCode.substring(1, gameCode.length - 1);
    document.getElementById("room-code").innerHTML = "Game Code: " + gameCode; 
    socket.onopen = (event) => socket.send("JOIN," + gameCode + ',' + currUser);
}

// MessageHandler Function
//NEWQ,question
socket.onmessage = (event) => handleMessage(event.data)
function handleMessage(data) {
    console.log(data);
    if (data.includes("NEWGAMECODE,")) { 
        gameCode = data.replace("NEWGAMECODE,","");
        document.getElementById("room-code").innerHTML = "Game Code: " + gameCode; 
    } else if (data.includes("NEWQ")) {
        questionList.push(data.replace("NEWQ,",""));
        populateQuestions();
        //const answers = data.split("/").map(a => a.split("+"));
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

//React:
class HostWaitingRoom extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            numRounds: "4",
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
            ce('input', {type:'range', min:'2', max:'8', value:this.state.numRounds, onChange: e => this.setState({numRounds:e})}),
            ce('span', {value:this.state.numRounds}),
            ce('br'),
            ce('p', {}, "Round time: "),
            ce('input', {type:'number', min:'5', max:'120', value:this.state.timerLength, onChange: e => this.setState({timerLength:e})}),
            ce('br'),
            ce('p', {}, "Submit a Question:"),
            ce('input', {type:'text', onChange: e => this.changeNewQuestion(e)}),
            ce('button', {onClick: e => this.sendQuestion(e)}, 'Send'),
            ce('button', {onClick: e => this.startGame(e)}, 'Start Game'),
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
            socket.send("HOSTREADY");
        }
}

class PlayerWaitingRoom extends React.Component {
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
            ce("h2", {}, "Welcome to the Waiting Room, " + this.state.userName + "!")
    )}
}

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