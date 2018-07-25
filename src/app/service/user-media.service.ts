import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserMediaService {

	constructor() { }

	hasUserMedia(){
		let medianavigator = <any>navigator;
		let checkWebRtcSupport = (medianavigator.getUserMedia || medianavigator.webkitGetUserMedia || medianavigator.mozGetUserMedia);
		return !!checkWebRtcSupport;
	}

	getMediaStream(){
		return new Promise((resolve, reject)=>{
			if(this.hasUserMedia()){
				let medianavigator = <any>navigator;
				medianavigator.getUserMedia = medianavigator.getUserMedia || medianavigator.webkitGetUserMedia || medianavigator.mozGetUserMedia;
				medianavigator.getUserMedia({ 
					video: true, 
					audio: true 
				}, (stream) => { 
      				resolve(stream);
			   	}, err => {
			   		reject(err);
			   	});
			}else{
				alert("usermediaservice:19 Webrtc not supported");
			}
		});
	}
}
