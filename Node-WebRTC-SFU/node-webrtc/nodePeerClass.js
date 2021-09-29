process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const wrtc = require('wrtc');
//const ws = require('websocket').w3cwebsocket;
//const autoBind = require('auto-bind');

class NodePeerClass {
    constructor(myFunc, ws, name) {
        // TODO: Solve this in a better manner
        // autoBind(this);
        this.gotMessageFromServer = this.gotMessageFromServer.bind(this);
        this.createUUID = this.createUUID.bind(this);
        this.gotRemoteStream = this.gotRemoteStream.bind(this);
        this.gotIceCandidate = this.gotIceCandidate.bind(this);
        this.pageReady = this.pageReady.bind(this);
        this.start = this.start.bind(this);
        this.getUserMediaSuccess = this.getUserMediaSuccess.bind(this);
        this.createdDescription = this.createdDescription.bind(this);
        this.errorHandler = this.errorHandler.bind(this);


        this.myFunc = myFunc;
        this.ws = ws;
        this.name = name;

        this.localVideo;
        this.localStream;
        this.remoteVideo;
        this.peerConnection;
        this.uuid;
        this.serverConnection;
        this.peerConnectionConfig = {
            'iceServers': [
                {'urls': 'stun:stun.stunprotocol.org:3478'},
                {'urls': 'stun:stun.l.google.com:19302'},
            ]
        };
    }

    pageReady() {
        this.uuid = this.createUUID();

        //this.localVideo = document.getElementById('localVideo');
        //this.remoteVideo = document.getElementById('remoteVideo');
        var ws = this.ws
        this.serverConnection = ws;

        const stuff = this;
        this.serverConnection.onmessage = stuff.gotMessageFromServer;

        var constraints = {
            video: true,
            audio: true,
        };

        // if(navigator.mediaDevices.getUserMedia) {
        //   navigator.mediaDevices.getUserMedia(constraints).then(this.getUserMediaSuccess).catch(this.errorHandler);
        // } else {
        //   alert('Your browser does not support getUserMedia API');
        // }
    }

    getUserMediaSuccess(stream) {
        this.localStream = stream;
        this.localVideo.srcObject = stream;
    }

    start(isCaller) {
        //console.log("SEEE YAAAA MAAAA")

        this.peerConnection = new wrtc.RTCPeerConnection(this.peerConnectionConfig);
        this.peerConnection.onicecandidate = this.gotIceCandidate;
        this.peerConnection.ontrack = this.gotRemoteStream;
        //this.peerConnection.addStream(this.localStream);

        if (isCaller) {
            this.peerConnection.createOffer().then(this.createdDescription).catch(this.errorHandler);
        }
    }

    gotMessageFromServer(message) {
        //console.log("hi!")
        if (!this.peerConnection) {
            this.start(false);
        }

        var signal = JSON.parse(message.data);

        // Ignore messages from ourself
        if (signal.uuid == this.uuid) return;

        if (signal.sdp) {
            this.peerConnection.setRemoteDescription(new wrtc.RTCSessionDescription(signal.sdp)).then(() => {
                // Only create answers in response to offers
                if (signal.sdp.type == 'offer') {
                    this.peerConnection.createAnswer().then(this.createdDescription).catch(this.errorHandler);
                }
            }).catch(this.errorHandler);
        } else if (signal.ice) {
            this.peerConnection.addIceCandidate(new wrtc.RTCIceCandidate(signal.ice)).catch(this.errorHandler);
        }
    }

    gotIceCandidate(event) {
        if (event.candidate != null) {
            this.serverConnection.send(JSON.stringify({'ice': event.candidate, 'uuid': this.uuid}));
        }
    }

    createdDescription(description) {
        console.log('got description');

        this.peerConnection.setLocalDescription(description).then(() => {
            this.serverConnection.send(JSON.stringify({
                'sdp': this.peerConnection.localDescription,
                'uuid': this.uuid
            }));
        }).catch(this.errorHandler);
    }

    gotRemoteStream(event) {
        //console.log(this.name + ': got remote stream');
        //this.remoteVideo.srcObject = event.streams[0];
        //this.peerConnection.addTrack(event.track, event.streams[0]);
        this.myFunc(this.name, event);
    }

    errorHandler(error) {
        console.log(error);
    }

    // Taken from http://stackoverflow.com/a/105074/515584
    // Strictly speaking, it's not a real UUID, but it gets the job done here
    createUUID() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
}

module.exports = NodePeerClass;

// TODO
// var oop = new serverOopClassWorking();
// oop.pageReady();
// oop.start(false);