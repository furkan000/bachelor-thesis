process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0; //TODO
const HTTPS_PORT = 8443;

const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;
const NodePeerClass = require('../node-webrtc/nodePeerClass')

// Yes, TLS is required
const serverConfig = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
};

// ----------------------------------------------------------------------------------------

// Create a server for the client html page
const handleRequest = function(request, response) {
  // Render the single client html file for any request the HTTP server receives
  console.log('request received: ' + request.url);

  if(request.url === '/') {
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(fs.readFileSync('client/index.html'));
  } else if(request.url === '/webrtc.js') {
    response.writeHead(200, {'Content-Type': 'application/javascript'});
    response.end(fs.readFileSync('client/webrtc.js'));
  }
};

const httpsServer = https.createServer(serverConfig, handleRequest);
httpsServer.listen(HTTPS_PORT, '0.0.0.0');

// ----------------------------------------------------------------------------------------



/*
PSEUDOCODE:
  if neue Verbindung
    lege neuen eintrag an
    erstelle neues Objekt
    füge alle existierenden Tracks hinzu irgendwie

    (übergebe dem Objekt den ws)
    var1: leite den traffic zu diesem Objekt weiter, überlasse ihm nur senden
    var2: übergebe dem Objekt den Socket und überlasse ihm das Empfangen + senden
    var3: handle den gesamten Traffic selbst

  if gotRemote: callback
    verteile seinen Stream an alle anderen Teilnehmer (idealerweise füge alle hinzu und dann offer)
    sorge dafür dass


  Frontend: Sei irgendwie in der Lage mehrere Webcams darzustellen
    TODO
*/


// Create a server for handling websocket calls
const wss = new WebSocketServer({server: httpsServer});
var myClients = {};
var myPeers = {};
var myTracks = [];

wss.on('connection', function(ws) {
  // On new websocket connection add new peerConnection entry
  var wsKey = ws.upgradeReq.headers['sec-websocket-key'];
  myClients[wsKey] = ws;
  myPeers[wsKey] = new NodePeerClass(myFunc, ws, wsKey);
  myPeers[wsKey].pageReady();  //Furkan ist ein Spaßßßt
  myPeers[wsKey].start()

  // Add all existing tracks to new peerConnection
  for(var tuple of myTracks){
    var event = tuple[1];
    console.log(event)
    myPeers[wsKey].peerConnection.addTrack(event.track, event.streams[0]);
    myPeers[wsKey].peerConnection.createOffer().then(myPeers[wsKey].createdDescription).catch(myPeers[wsKey].errorHandler);
  }
});

// When we get a new stream of a peer, we save it in our list and distribute it to all participants
function myFunc(name, event){
  console.log(name + ": got remote stream");
  myTracks.push([name,event]);

  for(var [key, peer] of Object.entries(myPeers)){
    if(key != name){
      peer.peerConnection.addTrack(event.track, event.streams[0]);
      peer.peerConnection.createOffer().then(peer.createdDescription).catch(peer.errorHandler);
    }
  }
}

console.log('Server running. Visit https://localhost:' + HTTPS_PORT + ' in Firefox/Chrome.\n\n\
Some important notes:\n\
  * Note the HTTPS; there is no HTTP -> HTTPS redirect.\n\
  * You\'ll also need to accept the invalid TLS certificate.\n\
  * Some browsers or OSs may not allow the webcam to be used by multiple pages at once. You may need to use two different browsers or machines.\n'
);