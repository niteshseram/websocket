import React from 'react'
import queryString from "query-string";
import { useLocation } from "react-router-dom";
import {useEffect, useState} from 'react';
import { MESSAGE_ENUM } from './constants';

const Chat = ({socket}) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState(""); 
  let location = useLocation();
  useEffect(()=> {
    const { name, room } = queryString.parse(location.search);
    const joinRoom = {
      type: "join",
      body: {
        name,
        room
      }
    }
    socket.send(JSON.stringify(joinRoom));
    socket.onmessage = evt => {
      let msg = JSON.parse(evt.data);
      console.log(msg);
      switch (msg.type) {
        case "message":
          console.log(`${msg.sender} says: ${msg.body}`);
          setMessages((messages) => [...messages, msg.message])
          console.log(`Messages: ${messages}`)
          break;
        default:
          console.log("Unknown message type.");
      }
    }
    // return () => {
    //   const disconnectRoom = {
    //     type: "disconnect"
    //   }
    //   socket.send(JSON.stringify(disconnectRoom));
    // }
  },[])

  const sendMessage = (e) => {
    e.preventDefault();
    let msg = {
      type: "sendMessage",
      body: message
    }
    console.log(msg);
    socket.send(JSON.stringify(msg));
    setMessage("")
  }
  return (
    <div>
      {messages.map((val, i) => {
        return (
          <div key={i}>
            {val.text}
            <br />
            <b>{val.user}</b>
          </div>
        );
      })}
      <form action="" onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <input type="submit" />
      </form>
    </div>
  )
}

export default Chat;