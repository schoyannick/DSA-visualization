import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { LinkedListComponent } from './linked-list/linked-list.component';

const routes: Routes = [
  { path: 'linked-list', component: LinkedListComponent },
  { path: 'll', component: LinkedListComponent },
  { path: '', component: AppComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
