import './App.css';
import React from "react";
import { BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {useEffect, useState} from 'react';

import Chat from './Chat';
import Home from './Home';

function App() {
  const [socket, setSocket] = useState(new WebSocket('ws://localhost:7777/ws'));
  useEffect(()=> {
    
    socket.onopen = ()=>{
      console.log("Connected");
    }
    return () => {
      socket.onclose = () => {
        console.log('WebSocket Disconnected');
        setSocket(new WebSocket('ws://localhost:7777/ws'));
      }
    }
  },[socket]);

  return (
    <Router>
      <Routes>
        <Route path="/" exact element={<Home />} />
        <Route path="/chat" element={<Chat socket={socket}/>} />
      </Routes>
    </Router>
  );
}

export default App;
