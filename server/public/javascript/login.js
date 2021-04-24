"use strict"

const ce = React.createElement
const csrfToken = document.getElementById("csrfToken").value;

//const validateJoinRoute = document.getElementById("validateUserJoin").value;
//const validateHostRoute = document.getElementById("validateHostJoin").value;
//const codeRoute = document.getElementById("createUserRoute").value;


class MainComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { createGameMessage: "", joinGameMessage: "", action: ""};
    }

  render() {
    if (this.state.action == "joining") {
        return ce(JoinComponent, {});
    }
    else if (this.state.action == "creating") {
        return ce(CreateComponent, {});
    } else {
        return ce('div', null,
            ce('h2', null, 'Create Game:'),
            ce('br'),
            ce('button', {onClick: e => this.createGame(e)}, 'Create'),
            ce('span', {id: "create-message"}, this.state.createGameMessage),
            ce('h2', null, 'Join Game:'),
            ce('br'),
            ce('button', {id: "join-button", onClick: e => this.joinGame(e)}, 'Join'),
            ce('span', {id: "join-message"}, this.state.joinGameMessage)
            )
        }
    }
    createGame(e) {
        this.setState({action:"creating"});
    }
    joinGame(e) {
        this.setState({action:"joining"});
    }
}

class CreateComponent extends React.Component {
  constructor(props) {
    super(props); // all the data necessary for creating a game will be defined here
    this.state = {
      userName: "", 
      gameCode: "",
      numRounds: "4", 
      createPass: "",
      loginMessage: "",
      createMessage: ""
    };
  }


  render() {

    return ce('div', {id: "ccdiv"},
        ce("h3", null, "Name: "),
        ce('br'),
        ce('form', {id:"submitFormHost", method:"POST", action:"/HostGame"}, 
        ce('input', {type: "text", id: "txtUsernameHost", value: this.state.userName, onChange: e => this.changeUsername(e)}),
        ce('input', {type: 'submit', id: "submitButtonHost", value:"Submit"})
        )
        );}

        changeUsername(e) {
            this.setState({userName: e.target.value});
            console.log(this.state.userName);
        }
         
}

class JoinComponent extends React.Component {
    constructor(props) { // all the data necessary for joining is defined here
        super(props);
        this.state = {
          userName: "", 
          gameCode: "",
          createName: "", 
          createPass: "",
          loginMessage: "",
          createMessage: ""
        };
      }

    render() {
        return ce('div', null, 
            ce("h2", null, "Join Game!"),
            ce('br'),
            ce('h3', null, "Name: "),
            ce('input', {type: "text", id: "txtUsernameJoin", value: this.state.userName, onChange: e => this.changeUsername(e)}),
            ce('br'),
            ce('h3', null, "Game Code: "),
            ce('input', {type: "text", id: "txtGameCodeJoin", value: this.state.gameCode, onChange: e => this.changeGameCode(e)}),
            ce('br'),
            ce('button', {id:"submitButtonJoin", action:'/HostGame'})
            );}
        
            changeGameCode(e) {
                this.setState({gameCode: e.target.value});
            }

            changeUsername(e) {
                this.setState({userName: e.target.value});
            }
}

ReactDOM.render(
  ce(MainComponent, null, null),
  document.getElementById('maindiv')
);