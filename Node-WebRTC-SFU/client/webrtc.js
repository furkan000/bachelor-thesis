class NodePeerClass {
    constructor(localVideo, remoteVideo, localStream, myFunc) {
        // TODO: Solve this in a better manner
        this.gotMessageFromServer = this.gotMessageFromServer.bind(this);
        this.createUUID = this.createUUID.bind(this);
        this.gotRemoteStream = this.gotRemoteStream.bind(this);
        this.gotIceCandidate = this.gotIceCandidate.bind(this);
        this.pageReady = this.pageReady.bind(this);
        this.start = this.start.bind(this);
        //this.getUserMediaSuccess = this.getUserMediaSuccess.bind(this);
        this.createdDescription = this.createdDescription.bind(this);
        this.errorHandler = this.errorHandler.bind(this);

        this.localVideo = localVideo;
        this.remoteVideo = remoteVideo;
        this.localStream = localStream;
        this.myFunc = myFunc;

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

        // this.localVideo = document.getElementById('localVideo');
        // this.remoteVideo = document.getElementById('remoteVideo');

        this.serverConnection = new WebSocket('wss://' + window.location.hostname + ':8443');
        const stuff = this;
        this.serverConnection.onmessage = stuff.gotMessageFromServer;

        // var constraints = {
        //     video: true,
        //     audio: true,
        // };
        //
        // if(navigator.mediaDevices.getUserMedia) {
        //   navigator.mediaDevices.getUserMedia(constraints).then(this.getUserMediaSuccess).catch(this.errorHandler);
        // } else {
        //   alert('Your browser does not support getUserMedia API');
        // }
    }

    // getUserMediaSuccess(stream) {
    //     this.localStream = stream;
    //     this.localVideo.srcObject = stream;
    // }

    start(isCaller) {
        this.peerConnection = new RTCPeerConnection(this.peerConnectionConfig);
        this.peerConnection.onicecandidate = this.gotIceCandidate;
        this.peerConnection.ontrack = this.gotRemoteStream;


        if(localStream != null){
            // localStream.getTracks().forEach(track => this.peerConnection.addTrack(track, localStream));
            this.peerConnection.addStream(localStream); //TODO This is not nice :(
        }

        console.log("peerconnection.addStream()");

        if (isCaller) {
            this.peerConnection.createOffer().then(this.createdDescription).catch(this.errorHandler);
            console.log("createOffer() then ...");
        }
    }

    gotMessageFromServer(message) {
        if (!this.peerConnection) {
            this.start(false);
        }

        var signal = JSON.parse(message.data);

        // Ignore messages from ourself
        if (signal.uuid == this.uuid) return;

        if (signal.sdp) {
            console.log("received sdp, setRemoteDiscription");
            this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                // Only create answers in response to offers
                if (signal.sdp.type == 'offer') {
                    console.log("createAnswer() then ...");
                    this.peerConnection.createAnswer().then(this.createdDescription).catch(this.errorHandler);
                }
            }).catch(this.errorHandler);
        } else if (signal.ice) {
            console.log("received ice, addIceCandidate");
            this.peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(this.errorHandler);
        }
    }

    gotIceCandidate(event) {
        console.log("gotIceCandidate, send candidate")
        if (event.candidate != null) {
            this.serverConnection.send(JSON.stringify({'ice': event.candidate, 'uuid': this.uuid}));
        }
    }

    createdDescription(description) {
        console.log('setLocalDescription, send localDescription');

        this.peerConnection.setLocalDescription(description).then(() => {
            this.serverConnection.send(JSON.stringify({
                'sdp': this.peerConnection.localDescription,
                'uuid': this.uuid
            }));
        }).catch(this.errorHandler);
    }

    gotRemoteStream(event) {
        this.myFunc(event);
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
//---------------------------------------------------
//---------------------------------------------------
//---------------------------------------------------





















var doneOnce = false;





console.log("Ja, es ist die richtige Datei")

var peer;


var localVideo;
var localStream;
var remoteVideo;


var video; // the latest video element


var testTable = document.getElementById('test-table'); //TODO: This doesn't do anything (return null) :/






function pageReady() {
    localVideo = document.getElementById('localVideo');
    remoteVideo = document.getElementById('remoteVideo');

    var constraints = {
        video: true,
        //audio: true,
    };

    if(navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia(constraints).then(getUserMediaSuccess).catch(errorHandler);
    } else {
      alert('Your browser does not support getUserMedia API');
    }

    peer = new NodePeerClass(localVideo, remoteVideo, localStream, myFunc);
    peer.pageReady();
}

function getUserMediaSuccess(stream) {
    localStream = stream;
    localVideo.srcObject = stream;
}

function start(isCaller) {
    peer.start(isCaller);
}









function errorHandler(error) {
    console.log(error);
}

function myFunc(event) {
    console.log('got remote stream');

    console.log(event);
    //remoteVideo.srcObject = event.streams[0];

    // TODO: understand better, refactor
    //if (video === undefined || video.srcObject !== event.streams[0]) {
        addNewVideoElement(event.streams[0]);
    //}


}

function addNewVideoElement(stream) {
    testTable = document.getElementById('test-table')
    // console.log("addNewVideoElement();");
    console.log(testTable);
    var newRow = testTable.insertRow(-1);
    var newCell = newRow.insertCell(-1);
    video = document.createElement('video');
    video.autoplay = true;
    newCell.appendChild(video);
    //navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(stream => video.srcObject = stream);
    video.srcObject = stream;

    // if(doneOnce === false){
    //     newPeer();
    // }
    // doneOnce = true;

    return video;
}



// Point serverConnection to other peer

function newPeer() {
    //initial experiments, only works with max new peer

    peer = new NodePeerClass(null, remoteVideo, localStream, myFunc);
    peer.pageReady();
    //...
    peer.start(false);

}

function doNothing(){
    console.log("doNothing()");
}









