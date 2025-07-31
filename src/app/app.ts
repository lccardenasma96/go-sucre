import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderCustomComponent } from './components/header-custom/header-custom.component';
import { HttpClientModule } from '@angular/common/http';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderCustomComponent, HttpClientModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'gosucre';
}