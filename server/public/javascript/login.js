"use strict"

const ce = React.createElement
const csrfToken = document.getElementById("csrfToken").value;
const song = new Audio("/versionedAssets/music/macintosh.mp3");
let playing = false;
let soundsrc = "";
let audioPromise = null;
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
      if(!playing) {
        audioPromise = song.play();
      } else {
        audioPromise = song.pause();
      } if (audioPromise !== undefined) {
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
      errorMessage: "",
      picSrc: "versionedAssets/images/0.png",
      picId: 0
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
                              ce('div', {className: 'col-8'},
                                ce('input',
                                    {className: "form-control mb-3", placeholder: "Username", type: "text", id: "txtUsernameHost", value: this.state.userName, onChange: e => this.changeUsername(e)}),
                                  ce('div', {id:'pic-div', className: 'row row-cols-3 my-3'},
                                      ce('div', {className: 'col'},
                                          ce('img', {className: 'img-fluid', src: "versionedAssets/images/1.png", onClick: e => this.changeAvatar(1)}),
                                      ),
                                      ce('div', {className: 'col'},
                                          ce('img', {className: 'img-fluid', src: "versionedAssets/images/2.png", onClick: e => this.changeAvatar(2)}),
                                      ),
                                      ce('div', {className: 'col'},
                                          ce('img', {className: 'img-fluid', src: "versionedAssets/images/3.png", onClick: e => this.changeAvatar(3)}),
                                      ),
                                      ce('div', {className: 'col'},
                                          ce('img', {className: 'img-fluid', src: "versionedAssets/images/4.png", onClick: e => this.changeAvatar(4)}),
                                      ),
                                      ce('div', {className: 'col'},
                                          ce('img', {className: 'img-fluid', src: "versionedAssets/images/5.png", onClick: e => this.changeAvatar(5)}),
                                      ),
                                      ce('div', {className: 'col'},
                                          ce('img', {className: 'img-fluid', src: "versionedAssets/images/6.png", onClick: e => this.changeAvatar(6)}),
                                      )
                                  )
                              ),
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

    changeAvatar(num) {
        this.setState({picId:num});
        const images = document.getElementById("pic-div").childNodes;
        for (let i = 0; i < images.length; i++) {
            if (num - 1 === i) {
                images.item(i).firstChild.parentElement.firstElementChild.className = "img-fluid active";
            } else {
                images.item(i).firstChild.parentElement.firstElementChild.className = "img-fluid";
            }
        }
    }

    changeUsername(e) {
        this.setState({userName: e.target.value});
    }

    handleSubmit(event) {
      let username = this.state.userName;
      let myPic = this.state.picId;


      while (username.includes(",")) {
        username = username.replace(",", "")
      }

      console.log(username)
      if (this.state.userName.length != 0) {
        fetch(validateHostRoute.value, {
          method: 'POST',
          headers: {'Content-Type': 'application/json', 'Csrf-Token': csrfToken },
          body: JSON.stringify({user:username + "," + myPic})
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

    goToPreviousPic() {
      const tempid = this.state.picId;
      if (tempid > 0) {
        this.setState({picId:tempid - 1})
        this.setState({picSrc:"versionedAssets/images/" + this.state.picId + ".png"})
        console.log("picId: " + this.state.picId)
      }
       else {
        this.setState({picId:6})
        this.setState({picSrc:"versionedAssets/images/" + this.state.picId + ".png"})
        console.log("picId: " + this.state.picId)
        }
    }

    goToNextPic() {
      const tempid = this.state.picId;
      if (tempid < 6) {
        this.setState({picId:tempid + 1})
        this.setState({picSrc:"versionedAssets/images/" + this.state.picId + ".png"})
        console.log("picId: " + this.state.picId)
      }
       else {
        this.setState({picId:0})
        this.setState({picSrc:"versionedAssets/images/" + this.state.picId + ".png"})
        console.log("picId: " + this.state.picId)
      }
    }

    playAudio(e) {

      if(!playing) {
        audioPromise = song.play();
        playing= true;
        soundsrc = "/versionedAssets/images/sound_off.png";
      } else {
        audioPromise = song.pause();
        playing = false;
        soundsrc = "/versionedAssets/images/sound_on.png";
      } if (audioPromise !== undefined) {
        audioPromise
          .then(_ => {
              const img = document.getElementById("music-button");
              img.setAttribute("src", soundsrc);
            // autoplay started
          })
          .catch(err => {
            // catch dom exception
            console.info(err)
          });
      };
    };

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
          errorMessage: "",
          picSrc: "versionedAssets/images/0.png",
          picId: 0
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
                                ce('div', {className: 'col-8'},
                                    ce('input',
                                        {className: "form-control mb-3", placeholder: "Game Code", type: "text", id: "txtGameCodeJoin", value: this.state.gameCode, onChange: e => this.changeGameCode(e)}),
                                    ce('input',
                                        {className: "form-control mb-3", placeholder: "Username", type: "text", id: "txtUsernameJoin", value: this.state.userName, onChange: e => this.changeUsername(e)}),
                                    ce('div', {id:'pic-div', className: 'row row-cols-3 my-3'}, 
                                      ce('div', {className: 'col'}, 
                                        ce('img', {className: 'img-fluid', src: "versionedAssets/images/1.png", onClick: e => this.changeAvatar(1)}),
                                      ), 
                                      ce('div', {className: 'col'}, 
                                        ce('img', {className: 'img-fluid', src: "versionedAssets/images/2.png", onClick: e => this.changeAvatar(2)}),
                                      ), 
                                      ce('div', {className: 'col'}, 
                                        ce('img', {className: 'img-fluid', src: "versionedAssets/images/3.png", onClick: e => this.changeAvatar(3)}),
                                      ),
                                      ce('div', {className: 'col'}, 
                                        ce('img', {className: 'img-fluid', src: "versionedAssets/images/4.png", onClick: e => this.changeAvatar(4)}),
                                      ),
                                      ce('div', {className: 'col'}, 
                                        ce('img', {className: 'img-fluid', src: "versionedAssets/images/5.png", onClick: e => this.changeAvatar(5)}),
                                      ),
                                      ce('div', {className: 'col'}, 
                                        ce('img', {className: 'img-fluid', src: "versionedAssets/images/6.png", onClick: e => this.changeAvatar(6)}),
                                      )
                                    )
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

    changeAvatar(num) {
        this.setState({picId:num});
        const images = document.getElementById("pic-div").childNodes;
        for (let i = 0; i < images.length; i++) {
            if (num - 1 === i) {
                images.item(i).firstChild.parentElement.firstElementChild.className = "img-fluid active";
            } else {
                images.item(i).firstChild.parentElement.firstElementChild.className = "img-fluid";
            }
        }
    }
        
    changeGameCode(e) {
        this.setState({gameCode: e.target.value});
    }

    changeUsername(e) {
        this.setState({userName: e.target.value});
    }

    handleSubmit(event) {
      let username = this.state.userName;
      const gameCode = this.state.gameCode;
      let myPic = this.state.picId;

      while (username.includes(",")) {
        username = username.replace(",", "")
      }

      if (username.length != 0 && gameCode != 0) {
        fetch(validateJoinRoute.value, {
          method: 'POST',
          headers: {'Content-Type': 'application/json', 'Csrf-Token': csrfToken },
          body: JSON.stringify({user:username + "," + myPic, code:gameCode})
          }
        ).then(res => res.text()).then(bool => {
          if (bool == 'true') {
            window.location.href = "/startGame"
          } else {
            this.state.errorMessage = "Invalid gamecode or username already taken"
          }
        });
      }
    }

    goToPreviousPic() {
      const tempid = this.state.picId;
      if (tempid > 0) {
        this.setState({picId:tempid - 1})
        this.setState({picSrc:"versionedAssets/images/" + this.state.picId + ".png"})
        console.log("picId: " + this.state.picId)
      }
       else {
        this.setState({picId:6})
        this.setState({picSrc:"versionedAssets/images/" + this.state.picId + ".png"})
        console.log("picId: " + this.state.picId)
       }
    }

    goToNextPic() {
      const tempid = this.state.picId;
      if (tempid < 6) {
        this.setState({picId:tempid + 1})
        this.setState({picSrc:"versionedAssets/images/" + this.state.picId + ".png"})
        console.log("picId: " + this.state.picId)
      }
       else {
        this.setState({picId:0})
        this.setState({picSrc:"versionedAssets/images/" + this.state.picId + ".png"})
        console.log("picId: " + this.state.picId)
      }
    }

    playAudio(e) {
      
      if(!playing) {
        audioPromise = song.play();
        playing= true;
        soundsrc = "/versionedAssets/images/sound_off.png";
      } else {
        audioPromise = song.pause();
        playing = false;
        soundsrc = "/versionedAssets/images/sound_on.png";
      } if (audioPromise !== undefined) {
        audioPromise
          .then(_ => {
              const img = document.getElementById("music-button");
              img.setAttribute("src", soundsrc);
            // autoplay started
          })
          .catch(err => {
            // catch dom exception
            console.info(err)
          });
      };
    };

    goBack(e) {
      this.props.goBackToMain();
    }
}

ReactDOM.render(
  ce(MainComponent, null, null),
  document.getElementById('maindiv')
);