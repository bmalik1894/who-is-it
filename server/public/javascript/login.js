"use strict"

const ce = React.createElement
const csrfToken = document.getElementById("csrfToken").value;
const song = new Audio("/versionedAssets/music/macintosh.mp3");

class MainComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { createGameMessage: "", joinGameMessage: "", action: ""};
    }
    
  render() {
    if (this.state.action === "joining") {
        return ce(JoinComponent, { goBackToMain: () => this.setState({action:"main"})});
    }
    else if (this.state.action === "creating") {
        return ce(CreateComponent, {goBackToMain: () => this.setState({action:"main"})});
    } else {
        return ce('div', {className: "container-sm mt-2 font-monospace"},
            ce('div', {className: "row justify-content-md-center"},
                ce('div', {className: "col-md-8"},
                    ce('div', {className: "card"},
                        ce('div', {className: 'card-header'},
                            ce('div', {className: 'card-title'},
                                ce('div', {className: 'row align-middle justify-content-between'},
                                    ce('div', {className: 'col-auto'},
                                        ce('h5',
                                            null,
                                            'Create/Join Game')
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
                                    "Welcome to Who Is It, an interactive online game that you can play with your friends! To begin, have a host create a game. Then, the host is given a join code to distribute to anyone else you want to play with. You can play with up to six players all at once."),
                            )
                        ),
                        ce('div', {className: 'card-footer'},
                            ce('button',
                                {className: "btn btn-primary me-3", onClick: e => this.createGame(e)},
                                'Create'),
                            ce('span',
                                {id: "create-message"},
                                this.state.createGameMessage),
                            ce('button',
                                {id: "join-button", className: "btn btn-primary", onClick: e => this.joinGame(e)},
                                'Join'),
                            ce('span',
                                {id: "join-message"},
                                this.state.joinGameMessage)
                        )
                    )
                )
            )
        )
        }
    }
    createGame(e) {
        this.setState({action:"creating"});
    }
    joinGame(e) {
        this.setState({action:"joining"});
    }
    playAudio(e) {
      const audioPromise = song.play();
      if (audioPromise !== undefined) {
        audioPromise
          .then(_ => {
              const img = document.getElementById("music-button");
              img.setAttribute("src", "/versionedAssets/images/sound_off.png");
            // autoplay started
          })
          .catch(err => {
            // catch dom exception
            console.info(err)
          });
      };
    };
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
      return ce('div', {className: "container-sm mt-2 font-monospace"},
          ce('div', {className: "row justify-content-md-center"},
              ce('div', {className: "col-md-8"},
                  ce('div', {className: "card"},
                      ce('div', {className: 'card-header'},
                          ce('div', {className: 'card-title'},
                              ce('div', {className: 'row align-middle justify-content-between'},
                                  ce('div', {className: 'col-auto'},
                                      ce('h5',
                                          null,
                                          'Create Game')
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
                                  "Enter the username you want to use below, then click submit to create a game."),
                              ce('div', {className: 'col-6'},
                                  ce('input',
                                      {className: "form-control mb-3", placeholder: "Username", type: "text", id: "txtUsernameHost", value: this.state.userName, onChange: e => this.changeUsername(e)}),
                                )
                          )
                      ),
                      ce('div', {className: 'card-footer'},
                          ce('button',
                              {type: 'submit', id: "submitButtonHost", className: "btn btn-primary me-3", onClick: e => this.handleSubmit(e), value:"Submit"},
                              'Create'),
                          ce('button',
                              {id: "goBackButtonJoin", className: "btn btn-secondary", onClick: e => this.goBack(e), value:"Go Back"},
                              'Back'),
                      )
                  )
              )
          )
      )
  }

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
        return ce('div', {className: "container-sm mt-2 font-monospace"},
            ce('div', {className: "row justify-content-md-center"},
                ce('div', {className: "col-md-8"},
                    ce('div', {className: "card"},
                        ce('div', {className: 'card-header'},
                            ce('div', {className: 'card-title'},
                                ce('div', {className: 'row align-middle justify-content-between'},
                                    ce('div', {className: 'col-auto'},
                                        ce('h5',
                                            null,
                                            'Join Game')
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
                                    "Enter your host's game code and the name you would like to use, then click join."),
                                ce('div', {className: 'col-6'},
                                    ce('input',
                                        {className: "form-control mb-3", placeholder: "Game Code", type: "text", id: "txtGameCodeJoin", value: this.state.gameCode, onChange: e => this.changeGameCode(e)}),
                                    ce('input',
                                        {className: "form-control mb-3", placeholder: "Username", type: "text", id: "txtUsernameJoin", value: this.state.userName, onChange: e => this.changeUsername(e)})
                                )
                            )
                        ),
                        ce('div', {className: 'card-footer'},
                            ce('button',
                                {id: "submitButtonJoin", className: "btn btn-primary me-3", onClick: e => this.handleSubmit(e), value:"Submit"},
                                "Join"),
                            ce('button',
                                {id: "goBackButtonJoin", className: "btn btn-secondary", onClick: e => this.goBack(e), value:"Go Back"},
                                "Back")
                        )
                    )
                )
            )
        )
    }
        
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