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
let numRounds = 12;
let currRound = 0;
let picId = currUser.split(",")[1]
currUser = currUser.split(",")[0]

// Opens socket through either host or player route
if (gameCode == 'host') {
    isHost = true;
    socket.onopen = (event) => socket.send("NEWGAME," + currUser + "," + picId);
} else {
    gameCode = gameCode.substring(1, gameCode.length - 1);
    //document.getElementById("room-code").innerHTML = gameCode;
    socket.onopen = (event) => socket.send("JOIN," + gameCode + ',' + currUser + "," + picId);
}

// MessageHandler Function - does bulk of the work
socket.onmessage = (event) => handleMessage(event.data)
function handleMessage(data) {
    console.log(data);
    if (data.includes("NEWGAMECODE,")) { // Recieve Code 
        gameCode = data.replace("NEWGAMECODE,","");
        document.getElementById("room-code").innerHTML = gameCode;
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
    let usersDiv = document.getElementById("users-div");
    for (const user of userList) {
        if (!usonBoard.includes(user)) {
            let div = document.createElement("div");
            div.className = "col";
            let avatar = document.createElement("img");
            avatar.setAttribute("src", "versionedAssets/images/" + user.split(",")[1] + ".png");
            avatar.className = "img-fluid";
            let paragraphTag = document.createElement("p");
            let strongTag = document.createElement("strong");
            strongTag.innerHTML = user.split(",")[0];
            paragraphTag.appendChild(strongTag);
            div.appendChild(avatar);
            div.appendChild(paragraphTag);
            usersDiv.appendChild(div);
            usonBoard.push(user);
        }
    }
}

// Add generic questions for debugging
function addGenericQuestions(number) {
    for (let i = 1; i <= number; i++) {
        socket.send("ADDQ,Question " + i);
    }
}

// get picId from username
function getPicIdFromUsername(username) {
    for (let i = 0; i < userList.length; i++) {
        if (userList[i].split(",")[0] == username) {
            console.log("found pic from user " + userList[i]);
            return userList[i].split(",")[1];
        }
    }
    return 0;
}


//React:
class HostWaitingRoom extends React.Component { ///////////////////////// HOST WAITING ROOM //////////////////////////////
    constructor(props) {
        super(props)
        this.state = {
            roundNumber: "12",
            questions: [],
            newQuestion: "",
            userName: currUser,
            picId: -1,
            timerLength: 60,
            errorMessage: "",
            ready: false
        }
    }

    render() {
        return ce('div', {className: "container-sm mt-2 font-monospace"},
            ce('div', {className: "row justify-content-md-center row-eq-height"},
                ce('div', {className: "col-lg-6"},
                    ce('div', {className: "card mb-3"},
                        ce('div', {className: 'card-header'},
                            ce('div', {className: 'card-title'},
                                ce('div', {className: 'row align-middle justify-content-between'},
                                    ce('div', {className: 'col-auto'},
                                        ce('h5',
                                            null,
                                            'Waiting for players...')
                                    ),
                                    ce('div', {className: 'col-auto'},
                                        ce('img',
                                            {src: "/versionedAssets/images/sound_on.png", id: "music-button", onClick: e => this.playAudio(e)}
                                        )
                                    )
                                ),
                            )
                        ),
                        ce('div', {className: 'card-body'},
                            ce('div', {className: 'window'},
                                ce('p',
                                    {className: "card-text my-3"},
                                    "Welcome, " + this.state.userName + "! As the host, you can select number of rounds, times, and approve/add questions to play with. When you're ready to go, click Ready. The game will begin when all players are ready. Alternatively, click Start to force the game to start immediately."),
                                ce('div', {className: 'row mb-3'},
                                    ce('div', {className: 'col'},
                                        ce('label', {className: 'form-label', htmlFor: 'roundTime'}, "Round time: "),
                                    ),
                                    ce('div', {className: 'col'},
                                        ce('input', {className: 'form-control', id: 'roundTime', type:'number', min:5, max:120, defaultValue:60, onChange: e => this.setState({timerLength:e.target.value})}),
                                    )
                                ),
                                ce('div', {className: 'row'},
                                    ce('div', {className: 'col'},
                                        ce('label', {className: 'form-label', htmlFor:'roundRange'}, "Number of Rounds: " + this.state.roundNumber)
                                    ),
                                    ce('div', {className: 'col'},
                                        ce('input', {className: 'form-range', id: 'roundRange', type:'range', min:8, max:16, defaultValue:12, onChange: e => this.sendRoundAmount(e)})
                                    )
                                ),
                                ce('div', {className: 'd-flex align-items-center my-3'},
                                    ce('div', {className: 'flex-shrink-0'},
                                        ce('img', {src: '/versionedAssets/images/join.png'})
                                    ),
                                    ce('div', {className: 'flex-grow-1 ms-3'},
                                        ce('p', {style:{marginBottom: "0"}},
                                            ce('strong', {className: 'user-select-all', id: 'room-code'}, gameCode)
                                        )
                                    )
                                ),
                                ce('div', {className: 'row justify-content-md-center'},
                                    ce('div', {className: 'col-sm-8'},
                                        ce('div', {className: 'row row-cols-3', id:'users-div', onClick: e => this.refreshUsers()})
                                    )
                                )
                            )
                        ),
                        ce('div', {className: 'card-footer'},
                            ce('button',
                                {className: "btn btn-primary me-3", id: "ready-game", onClick: e => this.startGame(e)},
                                "Ready"),
                            ce('button',
                                {className: "btn btn-primary me-3", onClick: e => this.forceGame(e)},
                                "Start")
                        )
                    )
                ),
                ce('div', {className: "col-lg-4"},
                    ce('div', {className: "card"},
                        ce('div', {className: 'card-header'},
                            ce('div', {className: 'card-title'},
                                ce('div', {className: 'row align-middle justify-content-between'},
                                    ce('div', {className: 'col-auto'},
                                        ce('h5',
                                            null,
                                            'Questions')
                                    ),
                                ),
                            )
                        ),
                        ce('div', {className: 'card-body'},
                            ce('div', {className: 'window'},
                                ce('p',
                                    {className: "card-text my-3"},
                                    "Submit a question to be used in the game."),
                                // Host didn't have onClick previously; idk if they need this?
                                ce('div', {id:"questiondiv", onClick: e => this.refreshQuestions()})
                            )
                        ),
                        ce('div', {className: 'card-footer'},
                        //     ce('div', {className: 'input-group mb-3'},
                        //         ce("select", {className: 'form-select',id:"dbquestions", onClick: e => this.populateDBQuestions()}, ce("option", null, "Add from database")),
                        //         ce('button', {className: 'btn btn-secondary',onClick: e => this.addDBQ()}, "Add")
                        //     ),
                            ce('input',
                                {className: "form-control mb-3", type: "text", placeholder: "Question", onChange: e => this.changeNewQuestion(e)}),
                            ce('button',
                                {className: "btn btn-primary me-3", onClick: e => this.sendQuestion(e)},
                                "Submit"),
                        )
                    )
                )
            )
        )
    }

    addDBQ() {
        let newdbq = document.getElementById("dbquestions").value
        if (newdbq !== "Add from database") {
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
        numRounds = this.state.timerLength;
    }

    sendTimerAmount(e) {
        this.setState({timerLength:e.target.value});
        socket.send("TIMER," + e.target.value);

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
        if (!this.state.ready) {
        socket.send("READY");
        const readyButton = document.getElementById("ready-game");
        readyButton.className = "btn btn-primary me-3 active";
        this.setState({ready:true})
        }
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
            errorMessage: "",
            ready: false
        }
    }

    render() {
        return ce('div', {className: "container-sm mt-2 font-monospace"},
            ce('div', {className: "row justify-content-md-center row-eq-height"},
                ce('div', {className: "col-lg-6"},
                    ce('div', {className: "card mb-3"},
                        ce('div', {className: 'card-header'},
                            ce('div', {className: 'card-title'},
                                ce('div', {className: 'row align-middle justify-content-between'},
                                    ce('div', {className: 'col-auto'},
                                        ce('h5',
                                            null,
                                            'Waiting for players...')
                                    ),
                                    ce('div', {className: 'col-auto'},
                                        ce('img',
                                            {src: "/versionedAssets/images/sound_on.png", id: "music-button", onClick: e => this.playAudio(e)}
                                        )
                                    )
                                ),
                            )
                        ),
                        ce('div', {className: 'card-body'},
                            ce('div', {className: 'window'},
                                ce('p',
                                    {className: "card-text my-3"},
                                    "Welcome, " + this.state.userName + "! Click ready when you're ready to start playing. The game will begin when the host starts the game, or everyone is ready."),
                                ce('div', {className: 'd-flex align-items-center mb-3'},
                                    ce('div', {className: 'flex-shrink-0'},
                                        ce('img', {src: '/versionedAssets/images/join.png'})
                                    ),
                                    ce('div', {className: 'flex-grow-1 ms-3'},
                                        ce('p', {style:{marginBottom: "0"}},
                                            ce('strong', {className: 'user-select-all', id: 'room-code'}, gameCode)
                                        )
                                    )
                                ),
                                ce('div', {className: 'row justify-content-md-center'},
                                    ce('div', {className: 'col-sm-8'},
                                        ce('div', {className: 'row row-cols-3', id:'users-div', onClick: e => this.refreshUsers()})
                                    )
                                )
                            )
                        ),
                        ce('div', {className: 'card-footer'},
                            ce('button',
                                {className: "btn btn-primary me-3", id: "ready-game", onClick: e => this.startGame(e), value:"Ready"},
                                "Ready"),
                        )
                    )
                ),
                ce('div', {className: "col-lg-4"},
                    ce('div', {className: "card"},
                        ce('div', {className: 'card-header'},
                            ce('div', {className: 'card-title'},
                                ce('div', {className: 'row align-middle justify-content-between'},
                                    ce('div', {className: 'col-auto'},
                                        ce('h5',
                                            null,
                                            'Questions')
                                    ),
                                ),
                            )
                        ),
                        ce('div', {className: 'card-body'},
                            ce('div', {className: 'window'},
                                ce('p',
                                    {className: "card-text my-3"},
                                    "Submit a question to be used in the game."),
                                ce('div', {id:"questiondiv", onClick: e => this.refreshQuestions()})
                            )
                        ),
                        ce('div', {className: 'card-footer'},
                            ce('input',
                                {className: "form-control mb-3", type: "text", placeholder: "Question", onChange: e => this.changeNewQuestion(e)}),
                            ce('button',
                                {className: "btn btn-primary me-3", onClick: e => this.sendQuestion(e)},
                                "Submit"),
                        )
                    )
                )
            )
        )
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

    refreshQuestions() {
        populateQuestions();
        this.setState({questions:questionList});
    }

    startGame() {
        if (!this.state.ready) {
        socket.send("READY");
        const readyButton = document.getElementById("ready-game");
        readyButton.className = "btn btn-primary me-3 active";
        this.setState({ready:true});    
        }
        
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
        round: currRound,
        errorMessage: ""
      };
    }

    componentDidMount() {
        currRound = currRound += 1
        if (firstRound) {
        this.grabQuestion();
        }
        this.addAnswers();
        this.setState({round: currRound})
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
            let playerdiv = document.createElement("div");
            playerdiv.active = false;
            playerdiv.onclick = function() {
                const allanswers = this.parentElement.children;
                let anyclicked = false;
                for (let i = 0; i < allanswers.length; i++) {
                    if (allanswers[i].active) {
                        anyclicked = true;
                    }
                }
                
                if (!anyclicked) {
                    socket.send("ANSWER," + player.split(",")[0]);
                    this.style.fontWeight = "bold";
                    this.active = true;    
                }
            }

            let playername = document.createElement('p');
            playername.innerHTML = index + '. ' + player.split(",")[0]; 
            index++;
            let playerpic = document.createElement('img');
            playerpic.src = "versionedAssets/images/" + player.split(",")[1] + ".png";    
            playerdiv.appendChild(playerpic);
            playerdiv.appendChild(playername);

            udiv.appendChild(playerdiv);
        }
        this.setState({currQuestion:currentQuestion});
    }

}

class RoundComponent extends React.Component { ////////////////////////////// ROUND OVER ////////////////////////////////////////
    constructor(props) {
        super(props);
        this.state = {
            whowon: "",
            whowonpic: 0,
            ready: false
        }
    }

    componentDidMount() {
        this.setState({whowon:winner, whowonpic:getPicIdFromUsername(winner)})
        firstRound = false;
    }


    render() {

        if (isHost) {
        return ce('div', {id:"NextRoundDiv"},
            ce("h3", {}, "ROUND OVER"),
            ce("div", {}, 
                ce('p', {}, "Winner:"),
                ce('img', {src:"versionedAssets/images/" + this.state.whowonpic + ".png"}),
                ce('p', {}, this.state.whowon)
            ),
            ce("button", { id:"NextButton", onClick: e => this.goToNextRound()}, "Next Round"),
            ce("button", { id:"HostNextButton", onClick: e => this.hostToNextRound()}, "Force Next Round")
            );
        j} else {
            return ce('div', {id:"NextRoundDiv"},
            ce("h3", {}, "ROUND OVER"),
            ce("div", {}, 
                ce('p', {}, "Winner:"),
                ce('img', {src:"versionedAssets/images/" + this.state.whowonpic + ".png"}),
                ce('p', {}, this.state.whowon)
            ),
            ce("button", { id:"NextButton", onClick: e => this.goToNextRound()}, "Next Round"),
            );
        }
    }

    goToNextRound() {
        if (!this.state.ready) {
            socket.send("NEXTROUND");
            this.setState({ready:true});
        }
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