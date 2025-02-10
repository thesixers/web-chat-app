import { useEffect, useRef, useState } from 'react'
import './App.css'
import io from 'socket.io-client'

// const socket = io.connect('http://localhost:3000', {query: {userNo}})


function App() {
  const [messageInput, setMessageInput] = useState('')
  const [messages, setMessages] = useState([])
  const [room, setRoom] = useState(null);
  const [roomInput, setRoomInput] = useState('');
  const [id, setId] = useState('')
  const [isId, setIsId] = useState(false)
  const socket = useRef()

  const sendMessage = () => {
    const data = {message: messageInput, user: id, room: room};
    setMessages((prev) => {
      let md = [...prev, {message: messageInput, user: id, room: room}]

      localStorage.setItem('gxmessages', JSON.stringify(md))

      return md
    })
    socket.current.emit('sendMessageToRoom', data)
    setMessageInput('')
  }

  const joinRoom = () => {
    // if(!isNaN(roomInput)){
      socket.current.emit('joinRoom', roomInput)
      setRoom(roomInput);
    // }
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

    if(localStorage.getItem('gxuserId')){
      let uid = localStorage.getItem('gxuserId')
      setId(uid)
      socket.current = io.connect('http://localhost:3000', {query: {uid}})
      setIsId(true)
    }

    if(socket.current){
      socket.current.on('RM', (data) => {
        console.log(data);
      })
    }

    return () =>{
      if(socket.current){
        socket.current.disconnect()
      }
    }
  }, [])

const handleAddMessage = (data) => {
  console.log(data);
  // setMessages((prev) =>  [...prev, data])
  setMessages((prev) => {
    let md = [...prev, data]

    localStorage.setItem('gxmessages', JSON.stringify(md))

    return md
  })
}
      


  function addId(){
    localStorage.setItem('gxuserId', id)
    let uid = id;
    setIsId(true)
    socket.current = io.connect('http://localhost:3000', {query: {uid}})
  }

  return (
    <>
      {
        !isId && (
          <div className="setid-wrapper">
            <div className="form">
              <h3>Set User ID or Name</h3>
              <input type="text" value={id} onInput={(e) => {setId(e.target.value)}} placeholder='Please enter a name'/>
              <button onClick={addId}>Set</button>
            </div>
          </div>
        )
      }
      {
        room ? 
        <div className="room-no">Room number: {room} <button onClick={() => {setRoom(null)}}>Reset</button></div>
          :
        <div className="add-room-container">
        <input type="text" placeholder='Enter Room ID' onChange={(e) => {setRoomInput(e.target.value)}} />
        <button onClick={joinRoom}>Join</button>
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
                  <div className={`message ${user === id ? "my-message" : "other-message"}`} key={index}>
                    {
                      user !== id &&(<div>~{user}~</div>)
                    }
                    {message}
                  </div>
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
