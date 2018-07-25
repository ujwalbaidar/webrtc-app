import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as io from "socket.io-client/dist/socket.io";
import { UserMediaService } from './user-media.service';

@Injectable({
  providedIn: 'root'
})
export class PeerconnectionService {
	peerConn: any;
	socket: any;
	stream: any;
	config = {
		'iceServers': [{
			'urls': 'stun:stun.l.google.com:19302'
		}]
	};
	remoteStream: any;
	streamChange: Subject<string> = new Subject<string>();

	constructor(private userMedia: UserMediaService) { }

	setSocket(socket){
		this.socket = socket;
	}

	createPeerConnection() {
		// this.socket = socket;
			// console.log('Creating Peer connection as initiator?', isInitiator, 'config:', config);
	  		this.peerConn = new RTCPeerConnection(this.config);
	  		// send any ice candidates to the other peer
			this.peerConn.onicecandidate = (event) => {
				console.log('icecandidate event:', event);
				if (event.candidate) {
					let sendMsgObj = {
						type: 'candidate',
						label: event.candidate.sdpMLineIndex,
						id: event.candidate.sdpMid,
						candidate: event.candidate.candidate
					};
					this.sendMessage(sendMsgObj)
				} else {
					console.log('End of candidates.');
				}
			};

			this.peerConn.onsignalingstatechange = () => {
				console.log('inside onsignalingstatechange')	
				console.log(this.peerConn.signalingState)	
			}

			this.peerConn.onnegotiationneeded = () => {
				console.log('inside onnegotiationneeded')
			}

			this.userMedia.getMediaStream()
				.then(stream=>{
					this.peerConn.addStream(stream);
				})
				.catch(streamErr=>{
					console.log(streamErr);
				});

			this.peerConn.ontrack = (event) => {
				// document.getElementById("received_video")['srcObject'] = event.streams[0];
				// document.getElementById("hangup-button")['disabled'] = false;
				this.remoteStream = event.streams[0];
				this.streamChange.next(this.remoteStream);
			};

			this.peerConn.oniceconnectionstatechange = event => {
		  		console.log('this.peerConn.iceConnectionState')
		  		console.log(this.peerConn.iceConnectionState)
			};
			/*if (isInitiator) {
		        // console.log('Creating Data Channel');
		        // let dataChannel = peerConn.createDataChannel('photos');
		        // onDataChannelCreated(dataChannel);

		        console.log('Creating an offer');
		        this.peerConn.createOffer()
		        	.then((offer) => {
						this.onLocalSessionCreated(offer);
					})
					// .then(function() {
					// Send the offer to the remote peer using the signaling server
					// })
					.catch(this.logError);
		        // peerConn.createOffer(this.onLocalSessionCreated, this.logError);
		    } else {
		        // peerConn.ondatachannel = function(event) {
		        //     console.log('ondatachannel:', event.channel);
		        //     dataChannel = event.channel;
		        //     onDataChannelCreated(dataChannel);
		        // };
		    }*/
	}

	sendOffer() {
		console.log('Creating an offer');
		// this.peerConn.createOffer().then(this.peerConn.setLocalDescription);
   //      this.peerConn.createOffer()
   //      	.then(offer => {
			// 	this.onLocalSessionCreated(offer);
			// })
			// .then(function() {
			// Send the offer to the remote peer using the signaling server
			// })
			// .catch(this.logError);

			this.peerConn.createOffer().then(offer => {
			    return this.peerConn.setLocalDescription(offer);
		  	})
		  	.then(() => {
			    // Send the offer to the remote peer using the signaling server
		  		this.sendMessage(this.peerConn.localDescription)
		  	})
		  	.catch(err => {
		  		console.log(err)
		  	});
	}

	onLocalSessionCreated(desc) {
	    // console.log('local session created:', desc);
	    // this.peerConn.setLocalDescription(desc, ()=>{
	    //     console.log('sending local desc:', this.peerConn.localDescription);
	    //     this.sendMessage(this.peerConn.localDescription);
	    // }, this.logError);
    	console.log('localDescription set')
	    this.peerConn.setLocalDescription(desc)
	    .then(() => {
	    	this.sendMessage(this.peerConn.localDescription)
	    }).catch(err => {
			console.log(err)
		})
	}

	sendMessage(message) {
	    console.log('Client sending message: ', message.type);
	    this.socket.emit('message', message);
	}

	logError(err) {
	    if (!err) return;
	    if (typeof err === 'string') {
	        console.warn(err);
	    } else {
	        console.warn(err.toString(), err);
	    }
	}

	getRemoteStream(){
		return this.remotestream;
	}

	signalingMessageCallback(message){
	    if (message.type === 'offer') {
	        console.log('Got offer. Sending answer to peer.');
	        console.log('this.peerConn', this.peerConn.signalingState)
	        if(this.peerConn.signalingState == 'closed') {
	        	this.createPeerConnection()
	        }
	    //     this.peerConn.setRemoteDescription(new RTCSessionDescription(message), function() {},this.logError);
	    //     this.peerConn.createAnswer()
	    //     	.then((offer) => {
					// 	this.onLocalSessionCreated(offer);
					// })
					// .catch(this.logError);

			this.peerConn.setRemoteDescription(message)
			.then(() =>{
				this.peerConn.createAnswer()
				.then(answer => {
					this.onLocalSessionCreated(answer)
				})
			}).catch(err => {
				console.log(err)
			})


	    } else if (message.type === 'answer') {
	        console.log('Got answer.');
	        console.log('this.peerConn', this.peerConn.signalingState)
	        if(this.peerConn.signalingState == 'closed') {
	        	this.createPeerConnection()
	        }
	        // this.peerConn.setRemoteDescription(new RTCSessionDescription(message), function() {},this.logError);
	        this.peerConn.setRemoteDescription(message, () => {
	        	console.log('answer set')
	        },this.logError);

	    } else if (message.type === 'candidate') {
	        this.peerConn.addIceCandidate(new RTCIceCandidate({
	            candidate: message.candidate
	        }));

	    }
	}
}
