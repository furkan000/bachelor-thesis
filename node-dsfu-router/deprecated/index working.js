Array.prototype.unique = function () {
  return this.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
}
var servers = ['ws://localhost:8001/helloworld', 'ws://localhost:8002/helloworld'];

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
  sessions.push(ws);


  ws.sfuWsList = [];
  for (let i = 0; i < servers.length; i++) {
    var sfuWs = new WebSocket(servers[i]);
    sfuWs.on('message', (answer) => { handleServerMessage(ws, i, answer) })
    ws.sfuWsList.push(sfuWs);
  }



  //------------------ SERVER ------------------
  // ws.sfu1 = new WebSocket('ws://localhost:8001/helloworld');
  // ws.sfu2 = new WebSocket('ws://localhost:8002/helloworld');

  // ws.sfu1.on('message', (answer) => { handleServerMessage(ws, 1, answer) });
  // ws.sfu2.on('message', (answer) => { handleServerMessage(ws, 2, answer) });

  //------------------ CLIENT ------------------
  ws.on('message', (message) => { handleClientMessage(ws, message) });
});




//------------------ HELPER ------------------ 

// function whichServer(name) {
//   console.log("####### whichServer: " + (names.indexOf(name) % 2 + 1));
//   console.log(names + "\t" + name)
//   return (names.indexOf(name) % 2 + 1);
// }


// function chooseServer(name, sfu1, sfu2) {
//   console.log("####### chooseServer: " + (names.indexOf(name) % 2 + 1));
//   console.log(names + "\t" + name)
//   if ((names.indexOf(name) % 2 + 1) == 1) {
//     return sfu1;
//   }
//   return sfu2;
// }

function sendToAllSfus(ws, message){
  ws.sfuWsList.forEach(sfu => {
    sfu.send(message);
  });
}
function getSfuIndex(ws, name) {
  var index = names.indexOf(name) % ws.sfuWsList.length;
  return index;
}

function sendToSfu(ws, name, message){
  ws.sfuWsList[getSfuIndex(ws, name)].send(message);
}


//------------------ CLIENT, SERVER ROUTING CODE ------------------ 

function handleServerMessage(ws, number, answer) {

  console.log("myNumberIs: " + number)

  console.log("SFU"+ number + ": " + answer.substr(0, 100));
  let obj = JSON.parse(answer);

  switch (obj.id) {
    case "existingParticipants":
      //if (whichServer(ws.name) == number) { ws.send(answer); }
      console.log(getSfuIndex(ws, ws.name) + "\t" + number)
      if (getSfuIndex(ws, ws.name) == number) { ws.send(answer); }

      break;
    case "receiveVideoAnswer":
      if (obj.name == ws.name) {
        if (getSfuIndex(ws, ws.name) == number) { ws.send(answer); }
      } else {
        ws.send(answer)
      }
      break;
    case "newParticipantArrived":
      if (getSfuIndex(ws, ws.name) == number) { ws.send(answer); }
      break;
    // case "iceCandidate":
    //   break;
    // case "participantLeft":
    //   break;
    default:
      ws.send(answer);
  }
}

function handleClientMessage(ws, message) {
  console.log('client' + sessions.indexOf(ws) + ' :' + message.substr(0, 100));

  var json = JSON.parse(message);
  // Für wenn vom Client Empfangen

  switch (json.id) {
    case "joinRoom":
      ws.name = json.name;
      names.push(json.name);
      console.log(names);
      sendToAllSfus(ws, message);
      break;
    case "receiveVideoFrom":
      sendToSfu(ws, json.sender, message)
      break;
    default:
      sendToAllSfus(ws, message);
  }
}







