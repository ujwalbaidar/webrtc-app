import { Component, OnInit } from '@angular/core';
import { UserMediaService } from '../service/user-media.service';
import { PeerconnectionService } from '../service/peerconnection.service';
import * as io from "socket.io-client/dist/socket.io";

@Component({
  selector: 'app-video-chat',
  templateUrl: './video-chat.component.html',
  styleUrls: ['./video-chat.component.css']
})
export class VideoChatComponent implements OnInit {
	public room: any;
	isInitiator: any;
	configuration:any = {
		'iceServers': [{
			'urls': 'stun:stun.l.google.com:19302'
		}]
	};
	socket: any;
	stream: any;
	remoteStream: any;
	_subscription: any;

	constructor(
		private userMedia: UserMediaService,
		private peerconnectionService: PeerconnectionService
	) {
		this.getRoom();
		this.initSocket();
		this.remoteStream = peerconnectionService.remoteStream;
	    this._subscription = peerconnectionService.streamChange.subscribe((value) => { 
	      	this.remoteStream = value; 
	      	let remoteVideo = document.getElementById('remoteVideo');
			remoteVideo['srcObject'] = this.remoteStream;
	    });
	}

	ngOnInit() {
		this.grabWebCamVideo()
	}

	grabWebCamVideo(){
		this.userMedia.getMediaStream()
			.then(stream=>{
				// debugger;
				this.stream = stream;
				this.gotStream(stream);
			})
			.catch(streamErr=>{
				console.log(streamErr);
			});
	}

	gotStream(stream) {
		let video = document.getElementById('localVideo');
		video['srcObject'] = stream;
	}

	getRoom() {
		this.room = window.location.hash.substring(1);
		if (!this.room) {
			this.room = window.location.hash = this.randomToken();
		}
	}

	randomToken() {
		return Math.floor((1 + Math.random()) * 1e16).toString(16).substring(1);
	}

	callFunc() {
		this.peerconnectionService.sendOffer()
	}

	initSocket(){
		// this.grabWebCamVideo();
		this.socket = io.connect();

		this.socket.on('ipaddr', (ipaddr) => {
			// debugger;
			console.log('Server IP address is: ' + ipaddr);
		});

		this.socket.on('created', (room, clientId) => {
  			console.log('Created room', room, '- my client ID is', clientId);
			// this.isInitiator = true;
			this.peerconnectionService.createPeerConnection()
		});

		this.socket.on('joined', (room, clientId) => {
			console.log('This peer has joined room', room, 'with client ID', clientId);
			// this.isInitiator = false;
			this.peerconnectionService.createPeerConnection()
			// this.grabWebCamVideo();
		});

		this.socket.on('full', (room) => {
			alert('Room ' + room + ' is full. We will create a new room for you.');
			window.location.hash = '';
			window.location.reload();
		});

		this.socket.on('ready', () => {
			console.log('Socket is ready');
			this.peerconnectionService.setSocket(this.socket)
		});

		this.socket.on('log', (array) => {
			// console.log.apply(console, array);
		});

		this.socket.on('message', (message) => {
			console.log('Client received message:', message);
			this.peerconnectionService.signalingMessageCallback(message);
		});

		// Joining a room.
		this.socket.emit('create or join', this.room);

		if (location.hostname.match(/localhost|127\.0\.0/)){
			this.socket.emit('ipaddr');
		}

		// Leaving rooms and disconnecting from peers.
		this.socket.on('disconnect', (reason) => {
			console.log(`Disconnected: ${reason}.`);
			// sendBtn.disabled = true;
			// snapAndSendBtn.disabled = true;
		});

		this.socket.on('bye', (room) => {
			console.log(`Peer leaving room ${room}.`);
			// sendBtn.disabled = true;
			// snapAndSendBtn.disabled = true;
			// // If peer did not create the room, re-enter to be creator.
			if (!this.isInitiator) {
				window.location.reload();
			}
		});
	}
}
