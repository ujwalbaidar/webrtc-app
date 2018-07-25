import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { VideoChatComponent } from './video-chat/video-chat.component';
import { UserMediaService } from './service/user-media.service';
import { PeerconnectionService } from './service/peerconnection.service';

@NgModule({
  declarations: [
    AppComponent,
    VideoChatComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [UserMediaService, PeerconnectionService],
  bootstrap: [AppComponent]
})
export class AppModule { }
