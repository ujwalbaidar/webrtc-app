import { Component, OnInit } from '@angular/core';
import { UserMediaService } from '../service/user-media.service';
import * as io from "socket.io-client/dist/socket.io";

@Component({
  selector: 'app-video-chat',
  templateUrl: './video-chat.component.html',
  styleUrls: ['./video-chat.component.css']
})
export class VideoChatComponent implements OnInit {
	public room: any;

	constructor(
		private userMedia: UserMediaService
	) {
		this.getRoom();
		this.initSocket();
	}

	ngOnInit() {
		this.grabWebCamVideo()
	}

	grabWebCamVideo(){
		this.userMedia.getMediaStream()
			.then(stream=>{
				this.gotStream(stream);
			})
			.catch(streamErr=>{
				console.log(streamErr);
			});
	}

	gotStream(stream) {
		let video = document.querySelector('video');
		video.srcObject = stream;
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

	initSocket(){
		let socket = io.connect();
		socket.on('ipaddr', (ipaddr) => {
			console.log('Server IP address is: ' + ipaddr);
		});

		socket.on('created', (room, clientId) => {
  			console.log('Created room', room, '- my client ID is', clientId);
			// isInitiator = true;
			// grabWebCamVideo();
		});

		socket.on('joined', (room, clientId) => {
			console.log('This peer has joined room', room, 'with client ID', clientId);
		// isInitiator = false;
		// createPeerConnection(isInitiator, configuration);
		// grabWebCamVideo();
		});

		socket.on('full', (room) => {
			alert('Room ' + room + ' is full. We will create a new room for you.');
			window.location.hash = '';
			window.location.reload();
		});

		socket.on('ready', () => {
			console.log('Socket is ready');
			// createPeerConnection(isInitiator, configuration);
		});

		socket.on('log', (array) => {
			console.log.apply(console, array);
		});

		socket.on('message', (message) => {
			console.log('Client received message:', message);
			// signalingMessageCallback(message);
		});

		// Joining a room.
		socket.emit('create or join', this.room);

		if (location.hostname.match(/localhost|127\.0\.0/)){
			socket.emit('ipaddr');
		}

		// Leaving rooms and disconnecting from peers.
		socket.on('disconnect', (reason) => {
			console.log(`Disconnected: ${reason}.`);
			// sendBtn.disabled = true;
			// snapAndSendBtn.disabled = true;
		});

		socket.on('bye', (room) => {
			console.log(`Peer leaving room ${room}.`);
			// sendBtn.disabled = true;
			// snapAndSendBtn.disabled = true;
			// // If peer did not create the room, re-enter to be creator.
			// if (!isInitiator) {
			// 	window.location.reload();
			// }
		});
	}
}
