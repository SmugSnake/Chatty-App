import React, {Component} from 'react';
import ChatBar from './ChatBar.jsx'
import MessageList from './MessageList.jsx'

export default class App extends Component {
  constructor() {
  super()
  this.state = {currentUser: {name: "Anonymous", color: this.randomColor()},
  messages: [],
  userCount: '0'
}
this.newMessage = this.newMessage.bind(this)
this.newCurrentUser = this.newCurrentUser.bind(this)
this.imageTest = this.imageTest.bind(this)
this.socket = new WebSocket('ws://localhost:3001')
}

randomColor() {
  return "#"+((1<<24)*Math.random()|0).toString(16)
}


newCurrentUser(username) {
let content = this.state.currentUser.name + " has changed their name to " + username + "."
let newMessage = JSON.stringify({type: 'postNotification', content: content})
this.socket.send(newMessage)
this.setState(prevState => ({currentUser: {name: username, color: prevState.currentUser.color}}))
}

imageTest(contentString) {
  //const testRegex = /^https?:\/\/(?:[a-z\-]+\.)+[a-z]{2,6}(?:\/[^\/#?]+)+\.(?:jpe?g|gif|png)$/;
  const testRegex = /(jpe?g|gif|png)(?=\?.+|$)/
  const contentArray = contentString.split(' ')
  let url;
  contentArray.forEach(function(word) {
    if (testRegex.test(word)) {
      url = word
  } 
  })
  if (url) {
    return {
      url: url,
     content: contentString.replace(url, '')
   }
  } else {
  return contentString;
 }
}


newMessage(content) {
  let imageUrl = this.imageTest(content)
  if (imageUrl.url) {
  let newMessage = JSON.stringify({username: this.state.currentUser.name, content: imageUrl.content, type: "postMessage", color: this.state.currentUser.color, image: imageUrl.url});
  console.log(imageUrl)
   this.socket.send(newMessage)
    } else {
      console.log("NOT ENTERING RIGHT ONE")
    let newMessage = JSON.stringify({username: this.state.currentUser.name, content: imageUrl, type: "postMessage", color: this.state.currentUser.color});
    this.socket.send(newMessage)
    }
  }


componentDidMount() {
 

 this.socket.onopen = (event) => {
     console.log('Connected to server');
 }
  this.socket.onmessage = (event) => {
    let data = JSON.parse(event.data)
     if (data.type === 'userCount') {
      this.setState({userCount: data.size})
    } else {
    let messages = this.state.messages.concat(data)
      this.setState({messages: messages})
    }
    }
  }


  render() {
    return (
        <div>
        <nav className="navbar">
          <a href="/" className="navbar-brand" >Chatty</a>
          <span className="user-count">{this.state.userCount} users online</span>
        </nav>
        <MessageList messages={this.state.messages}/>
        <ChatBar currentUser={this.state.currentUser.name} newMessage={this.newMessage} newCurrentUser={this.newCurrentUser}/>
      </div>
      )
      }
      }
