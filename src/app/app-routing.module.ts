import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';



@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes, { useHash: true })],

})
export class AppRoutingModule { }
