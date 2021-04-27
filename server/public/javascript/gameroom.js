"use strict"

const socketRoute = document.getElementById("ws-route").value;
let websock = (location.protocol == "https:") ? socketRoute.replace("http","wss") : socketRoute.replace("http", "ws");
const socket = new WebSocket(websock);
let currUser = document.getElementById("usernameInput").value;
currUser = currUser.substring(1, currUser.length - 1)
let isHost = false
if (document.getElementById("stateInput").value == 'host') {
    isHost = true 
}

if (isHost) {
    socket.onopen = (event) => socket.send("NEWGAME," + currUser);
} else {
    socket.onopen = (event) => socket.send("JOIN," + currUser);
}

console.log(isHost + " " + currUser);

//React:
//Enter Username
//class LoginComponent extends React.Component {
    // constructor(props) {
    //     super(props);
    //     this.state = {
    //       userName: "", 
    //       createMessage: "",
    //     };
    //   }
    // render() {
    //     return ce('div', null,
    //       ce('h2', null, 'Login:'),
    //       ce('br'),
    //       'Username: ',
    //       ce('input', {type: "text", id: "userName", value: this.state.loginName, onChange: e => this.changerHandler(e)}),
    //       ce('br'),
    //       ce('button', {onClick: e => this.createUser(e)}, 'Create User'),
    //       ce('span', {id: "create-message"}, this.state.createMessage)
    //     );
    //   }
    // changerHandler(e) {
    //     this.setState({ [e.target['id']]: e.target.value });
    //   }