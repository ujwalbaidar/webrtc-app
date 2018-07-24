import { Component, OnInit } from '@angular/core';
import { UserMediaService } from '../service/user-media.service';

@Component({
  selector: 'app-video-chat',
  templateUrl: './video-chat.component.html',
  styleUrls: ['./video-chat.component.css']
})
export class VideoChatComponent implements OnInit {

	constructor(private userMedia: UserMediaService) { }

	ngOnInit() {
		this.userMedia.getMediaStream()
			.then(stream=>{
				debugger;
			})
			.catch(streamErr=>{
				console.log(streamErr);
			});
	}

}
