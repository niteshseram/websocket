const uWS = require('uWebSockets.js');
const { uuid } = require('uuidv4');
const port = 7777;
const { addUser, removeUser, findUser } = require("./user");
// let SOCKETS = [];

const decoder = new TextDecoder('utf-8');

// add an enum with Object.freeze for code safety

const app = uWS.App()
  .ws('/ws', {
    // config
    compression: 0,
    maxPayloadLength: 16 * 1024 * 1024,
    idleTimeout: 60,

    open: (ws, req) => {
      // subscribe to topics
      // ws.subscribe(MESSAGE_ENUM.CLIENT_CONNECTED);
      // ws.subscribe(MESSAGE_ENUM.CLIENT_DISCONNECTED);
      // ws.subscribe(MESSAGE_ENUM.CLIENT_MESSAGE);

      // global SOCKETS array created earlier
      // SOCKETS.push(ws);

      // send to connecting socket only
      ws.send("Connected");

      // send to *all* subscribed sockets
      // app.publish(MESSAGE_ENUM.CLIENT_CONNECTED, JSON.stringify(pubMsg))
    },

    message: (ws, message, isBinary) => {
      // called when a client sends a message
      // decode message from client
      let clientMsg = JSON.parse(decoder.decode(message));
      let serverMsg = {};

      switch (clientMsg.type) {
        case "join": {
          const {name, room} = clientMsg.body;
          ws.id = uuid();
          const { user, error } = addUser({ id: ws.id, name, room });
          ws.subscribe(user.room);
          const msg = {
            type: "message",
            message: {
              user: "Admin",
              text: `Welocome to ${user.room}`,
            }
          }
          const allMsg = {
            type: "message",
            message: {
              user: "Admin", 
              text: `${user.name} has joined!`
            } 
          }
          ws.send(JSON.stringify(msg));
          app.publish(user.room, JSON.stringify(allMsg));
          break;
        }
        case "sendMessage": {
          const user = findUser(ws.id);
          const msg= {
            type: "message",
            message: {
              user: user.name,
              text: clientMsg.body,
            }
          }
          app.publish(user.room, JSON.stringify(msg));
          break;
        }
        case "disconnect":
          const user = removeUser(ws.id);
          serverMsg = {
            type: "message",
            message: {
              user: "Admin",
              text: `${user.name} just left the room`,
            }
          };

          app.publish(user.room, JSON.stringify(serverMsg));
          break;
        default:
          console.log("Unknown message type.");
      }
    },

    close: (ws, code, message) => {
      // called when a ws connection is closed
      // SOCKETS.find((socket, index) => {
      //   if (socket && socket.id === ws.id) {
      //     SOCKETS.splice(index, 1);
      //   }
      // });
    
      // let pubMsg = {
      //   type: MESSAGE_ENUM.CLIENT_DISCONNECTED,
      //   body: {
      //     id: ws.id,
      //     name: ws.name
      //   }
      // }
    
      // ws.send("Disconnected");
    }
  }).listen(port, token => {
    token ?
    console.log(`Listening to port ${port}`) :
    console.log(`Failed to listen to port ${port}`);
  });

  function getRandomInt() {
    return Math.floor(Math.random() * Math.floor(9999));
  }
  
  function createName(randomInt) {
    return SOCKETS.find(ws => ws.name === `user-${randomInt}`) ? createName(getRandomInt()) : `user-${randomInt}`
  }