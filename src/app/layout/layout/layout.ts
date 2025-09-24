import { Component } from '@angular/core';
import { SideBar } from '../side-bar/side-bar';
import { Header } from '../header/header';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [SideBar, Header, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout {

}
