import { useEffect, useState } from 'react'
import './App.css'
import io from 'socket.io-client'

// const socket = io.connect('http://localhost:3000', {query: {userNo}})
const socket = io.connect('https://chat-app-server-nz3i.onrender.com')


function App() {
  const [messageInput, setMessageInput] = useState('')
  const [messages, setMessages] = useState([])
  const [room, setRoom] = useState(null);
  const [roomInput, setRoomInput] = useState('');

  const sendMessage = () => {
    const data = {message: messageInput, user: 'other', room: room};
    setMessages((prev) => {
      let md = [...prev, {message: messageInput, user: 'me', room: room}]

      localStorage.setItem('gxmessages', JSON.stringify(md))

      return md
    })
    socket.emit('sendMessageToRoom', data)
  }

  const joinRoom = () => {
    if(!isNaN(roomInput)){
      socket.emit('joinRoom', roomInput)
      setRoom(roomInput);
    }
  }

  useEffect(() => {
    // if(!localStorage && !localStorage.getItem('gxmessages')) return;

    if(localStorage.getItem('gxmessages')){
      let ms = JSON.parse(localStorage.getItem('gxmessages'));
      let empty = [];
      Object.values(ms).forEach(value => {
        empty.push(value);
      })

      setMessages((prev) =>  [...empty])
    }
  }, [])

  useEffect(() => {
    const handleAddMessage = (data) => {
      // setMessages((prev) =>  [...prev, data])
      setMessages((prev) => {
        let md = [...prev, data]
  
        localStorage.setItem('gxmessages', JSON.stringify(md))
  
        return md
      })
    }
    socket.on("receiveMessage", handleAddMessage);

    return () => {
      socket.off("receiveMessage", handleAddMessage); // Cleanup to avoid duplicates
    };
  }, [socket]);

  return (
    <>
      {
        room ? 
        <div className="room-no">Room number: {room} <button onClick={() => {setRoom(null)}}>Reset</button></div>
          :
        <div className="add-room-container">
        <input type="text" onChange={(e) => {setRoomInput(e.target.value)}} />
        <button onClick={() => {joinRoom()}}>Join</button>
      </div>
      }
      
      <div className="message-container">
        <div className="messages">
          {
            !messages || messages.length === 0 ? <div>No Messages</div> 
            : 
            messages.filter((val) => {if(val.room === room) {return true}}).map((data, index) => {
              const {message, user} = data
                return(
                  <div className={`message ${user === "me" ? "my-message" : "other-message"}`} key={index}>{message}</div>
                )
            })
          }
          
        </div>
        <input 
        type="text" 
        placeholder='Enter ur message'
        value={messageInput}
        onChange={(e) => {setMessageInput(e.target.value)}}
        />
        <button onClick={() => {sendMessage()}}> Send a message </button>
      </div>
    </>
  )
}

export default App
