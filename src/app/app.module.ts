import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { VideoChatComponent } from './video-chat/video-chat.component';
import { UserMediaService } from './service/user-media.service';

@NgModule({
  declarations: [
    AppComponent,
    VideoChatComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [UserMediaService],
  bootstrap: [AppComponent]
})
export class AppModule { }
