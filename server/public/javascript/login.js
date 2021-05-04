"use strict"

const ce = React.createElement
const csrfToken = document.getElementById("csrfToken").value;

class MainComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { createGameMessage: "", joinGameMessage: "", action: ""};
    }

  render() {
    if (this.state.action == "joining") {
        return ce(JoinComponent, { goBackToMain: () => this.setState({action:"main"})});
    }
    else if (this.state.action == "creating") {
        return ce(CreateComponent, {goBackToMain: () => this.setState({action:"main"})});
    } else {
        return ce('div', {class: "card"}, ce('div', {class: 'card-body'},
            ce('h2', {class: "card-title"}, 'Create or Join a Game:'),
            ce('br'),
            ce('button', {class: "btn btn-primary", style: {marginRight: "20px"}, onClick: e => this.createGame(e)}, 'Create'),
            ce('span', {id: "create-message"}, this.state.createGameMessage),
            ce('button', {id: "join-button", class: "btn btn-primary", onClick: e => this.joinGame(e)}, 'Join'),
            ce('span', {id: "join-message"}, this.state.joinGameMessage)
            ))
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
      errorMessage: ""
    };
  }



  render() {
    return ce('div', {id: "ccdiv"},
        ce("h4", null, "Name: "),
        ce('br'),
        ce('input', {type: "text", id: "txtUsernameHost", value: this.state.userName, onChange: e => this.changeUsername(e)}), //add csrf token to header
        ce('button', {type: 'submit', id: "submitButtonHost", class: "btn btn-primary", onClick: e => this.handleSubmit(e), value:"Submit"}, "Submit"),
        ce('br'),
        ce('button', {id: "goBackButtonJoin", class: "btn btn-secondary", onClick: e => this.goBack(e), value:"Go Back"}, "Go Back")
        );}

        changeUsername(e) {
            this.setState({userName: e.target.value});
        }

        handleSubmit(event) {
          const username = this.state.userName;
          console.log(username)
          if (this.state.userName.length != 0) {
            fetch(validateHostRoute.value, { 
              method: 'POST', 
              headers: {'Content-Type': 'application/json', 'Csrf-Token': csrfToken }, 
              body: JSON.stringify({user:username})
              }
            ).then(res => res.text()).then(bool => {
              if (bool == 'true') {
                window.location.href = "/startGame"
              } else {
                this.state.errorMessage = "Failed check"  
              }
            });
            
          }
        }

        goBack(e) {
          this.props.goBackToMain();
        }
}

class JoinComponent extends React.Component {
    constructor(props) { // all the data necessary for joining is defined here
        super(props);
        this.state = {
          userName: "", 
          gameCode: "",
          errorMessage: ""
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
            ce('button', {id: "submitButtonJoin", class: "btn btn-primary", onClick: e => this.handleSubmit(e), value:"Submit"}, "Submit"),
            ce('br'),
            ce('button', {id: "goBackButtonJoin", class: "btn btn-secondary", onClick: e => this.goBack(e), value:"Go Back"}, "Go Back")
        );}
        
            changeGameCode(e) {
                this.setState({gameCode: e.target.value});
            }

            changeUsername(e) {
                this.setState({userName: e.target.value});
            }

            handleSubmit(event) {
              const username = this.state.userName;
              const gameCode = this.state.gameCode;
              if (this.state.userName.length != 0 && this.state.gameCode != 0) {
                fetch(validateJoinRoute.value, { 
                  method: 'POST', 
                  headers: {'Content-Type': 'application/json', 'Csrf-Token': csrfToken }, 
                  body: JSON.stringify({user:username, code:gameCode})
                  }
                ).then(res => res.text()).then(bool => {
                  if (bool == 'true') {
                    window.location.href = "/startGame"
                  } else {
                    this.state.errorMessage = "Failed check"  
                  }
                });
              }
            }

            goBack(e) {
              this.props.goBackToMain();
            }
}

ReactDOM.render(
  ce(MainComponent, null, null),
  document.getElementById('maindiv')
);