import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LinkedListComponent } from './linked-list/linked-list.component';

@NgModule({
  declarations: [AppComponent, LinkedListComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent, LinkedListComponent],
})
export class AppModule {}
