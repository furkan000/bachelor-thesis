process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const WebSocket = require('ws');

var servers = ['ws://18.195.137.89:8443/helloworld', 'ws://18.159.244.138:8443/helloworld'];
var sessions = [];
var names = [];

const wss = new WebSocket.Server({ path: '/helloworld', port: 8000 });
wss.on('connection', function connection(ws) {
  sessions.push(ws);

  // server websockets
  ws.sfuWsList = [];
  for (let i = 0; i < servers.length; i++) {
    var sfuWs = new WebSocket(servers[i]);
    sfuWs.on('message', (answer) => { handleServerMessage(ws, i, answer); })
    ws.sfuWsList.push(sfuWs);
  }

  // client websocket
  ws.on('message', (message) => { handleClientMessage(ws, message); });
});

/* -------------------------------------------------------------------------- */
/*                   handle and route client/server messages                  */
/* -------------------------------------------------------------------------- */

function handleServerMessage(ws, number, answer) {
  console.log("SFU" + number + ": " + answer.substr(0, 100));
  let json = JSON.parse(answer);

  switch (json.id) {
    case "existingParticipants":
      if (getSfuIndex(ws, ws.name) == number) { ws.send(answer); }
      break;
    case "receiveVideoAnswer":
      if (json.name == ws.name) {
        if (getSfuIndex(ws, ws.name) == number) { ws.send(answer); }
      } else {
        ws.send(answer);
      }
      break;
    case "newParticipantArrived":
      if (getSfuIndex(ws, ws.name) == number) { ws.send(answer); }
      break;
    // case "iceCandidate":
    // case "participantLeft":
    default:
      ws.send(answer);
  }
}

function handleClientMessage(ws, message) {
  console.log('client' + sessions.indexOf(ws) + ' :' + message.substr(0, 100));
  let json = JSON.parse(message);

  switch (json.id) {
    case "joinRoom":
      ws.name = json.name;
      names.push(json.name);
      sendToAllSfus(ws, message);
      break;
    case "receiveVideoFrom":
      sendToSfu(ws, json.sender, message)
      break;
    // case "onIceCandidate":
    // case "leaveRoom":
    default:
      sendToAllSfus(ws, message);
  }
}

/* --------------------- helper functions for routing of messages --------------------- */

function sendToAllSfus(ws, message) {
  ws.sfuWsList.forEach(sfu => {
    sfu.send(message);
  });
}

function getSfuIndex(ws, name) {
  var index = names.indexOf(name) % ws.sfuWsList.length;
  return index;
}

function sendToSfu(ws, name, message) {
  ws.sfuWsList[getSfuIndex(ws, name)].send(message);
}
