Array.prototype.unique = function () {
  return this.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
}

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
//process.setMaxListeners(0);

const WebSocket = require('ws');
const wss = new WebSocket.Server({ path: '/helloworld', port: 8000 });


// Notizen:
// client: joinRoom, receiveVideoFrom, onIceCandidate, leaveRoom
// server: existingParticipants, receiveVideoAnswer, newParticipantArrived, iceCandidate, participantLeft

var sessions = [];
var names = [];


wss.on('connection', function connection(ws) {
  console.log("hello");
  sessions.push(ws);

  //------------------ SERVER ------------------
  ws.sfu1 = new WebSocket('ws://localhost:8001/helloworld');
  ws.sfu2 = new WebSocket('ws://localhost:8002/helloworld');

  ws.sfu1.on('message', (answer) => {
    if (JSON.parse(answer).id == 'receiveVideoAnswer') {
      if (answer.name == ws.name) {
        if (names.indexOf(ws.name) % 2 + 1 == 1) {
          ws.send(answer);
          console.log("SFU1: " + answer.substr(0, 100))
        }
      } else {
        ws.send(answer)
        console.log("SFU1: " + answer.substr(0, 100))
      }
    }else{
    console.log("SFU1: " + answer.substr(0, 100))
      ws.send(answer);     
    }
  });
  // SFU1: receiveVideoAnswer verteilt




  // SFU2: receiveVideoAnswer verteilen, keine existingParticipants, keine newParticipantArrived
  ws.sfu2.on('message', (answer) => {
    var obj = JSON.parse(answer);
    switch (JSON.parse(answer).id) {
      case "existingParticipants":
        break;
      case "receiveVideoAnswer":
        if (obj.name == ws.name) {
          if (names.indexOf(ws.name) % 2 + 1 == 2) {
            ws.send(answer);
            console.log("SFU2: " + answer.substr(0, 100));
          }
        } else {
          ws.send(answer);
          console.log("SFU2: " + answer.substr(0, 100));
        }
        break;
      case "newParticipantArrived":
        break;
      // case "iceCandidate":
      //   break;
      // case "participantLeft":
      //   break;
      default:
        ws.send(answer);
        console.log("SFU2: " + answer.substr(0, 100));
    }
  });

  //------------------ CLIENT ------------------
  ws.on('message', function incoming(message) {
    console.log('client' + sessions.indexOf(ws) + ' :' + message.substr(0, 100));

    var json = JSON.parse(message);
    // Für wenn vom Client Empfangen

    switch (json.id) {
      case "joinRoom":
        ws.name = json.name;
        names.push(json.name);
        // Send to all messages
        ws.sfu1.send(message);
        ws.sfu2.send(message);
        break;
      case "receiveVideoFrom":
        whichServer(json.sender, ws.sfu1, ws.sfu2).send(message);
        break;
      default:
        ws.sfu1.send(message);
        ws.sfu2.send(message);
    }
  })
  // wsServer.send(message);
  // wsServer.on('message', (answer) => ws.send(answer));
});
//ws.send('something');




function whichServer(name, sfu1, sfu2) {
  if ( (names.indexOf(name) % 2 + 1) == 1) {
    console.log('sending to SFU1');
    return sfu1;
  }
  console.log('sending to SFU2');
  return sfu2;
}





