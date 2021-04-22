"use strict"

let messages = [];

const ce = React.createElement
const csrfToken = document.getElementById("csrfToken").value;

//const validateRoute = document.getElementById("validateUserRoute").value;
//const createRoute = document.getElementById("createUserRoute").value;

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

  componentDidMount() {
      this.generateGameCode();
  }

  render() {
    /*return ce('div', null,
      ce('h2', null, 'Name:'),
      ce('br'),
      ce('input', {type: "text", id: "loginName", value: this.state.userName, onChange: e => this.changerHandler(e)}),
      ce('br'),
      ce('button', {onClick: e => this.createGame(e)}, 'Create'),
      ce('span', {id: "login-message"}, this.state.loginMessage),
      ce('h2', null, 'Create User:'),
      ce('br'),
      'Username: ',
      ce('input', {type: "text", id: "createName", value: this.state.createName, onChange: e => this.changerHandler(e)}),
      ce('br'),
      'Password: ',
      ce('input', {type: "password", id: "createPass", value: this.state.createPass, onChange: e => this.changerHandler(e)}),
      ce('br'),
      ce('button', {onClick: e => this.createUser(e)}, 'Create User'),
      ce('span', {id: "create-message"}, this.state.createMessage)
    );*/
    return ce(div, null,
        ce("h2", null, "Name"),
        ce('br'),
        ce('input', {type: "text", id: "username-slot", value: this.state.userName, onChange: e => this.changeUsername(e)}),
        ce('br'),
        ce('input', {type: "range", id: "numRounds", min: "1", max: "8", value: "4", onChange: e=> this.changeRange(e)})
        );}

        changeRange(e) {
            console.log("Changing range to " + e.value);
            this.setState(e.value);
        }

        changeUsername(e) {
            this.setState({userName: e.target.value});
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
        return ce(div, null, 
            ce("h2", null, "Join Game!"),
            ce('br'),
            ce('input', {type: "text", id: "username-slot", value: this.state.userName, onChange: e => this.changeUsername(e)}),
            ce('br'),
            ce('input', {type: "text", id: "txtGameCode", value: this.state.gameCode, onChange: e => this.changeGameCode(e)}),
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