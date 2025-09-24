import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Auth } from '../../auth/services/auth';

@Component({
  selector: 'app-side-bar',
  imports: [CommonModule, RouterModule],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.scss',
  standalone: true
})
export class SideBar {
  constructor(
    private authService: Auth
  ) { }

  public logout() {
    this.authService.logout();
    window.location.reload();
  }
  public sideBarItems: any[] = [
      {
        name: 'Dashboard',
        icon: 'fa-solid fa-house',
        route: '/dashboard',
        active: false
      },
      {
        name: 'Members',
        icon: 'fa-solid fa-users',
        route: '/members',
        active: false
      },
      {
        name: 'Trainers',
        icon: 'fa-solid fa-user-tie',
        route: '/trainers',
        active: false
      },
      {
        name: 'Plans',
        icon: 'fa-solid fa-list-check',
        route: '/subscriptions-plans',
        active: false
      },
      {
        name: 'Payments',
        icon: 'fa-solid fa-credit-card',
        route: '/payments',
        active: false
      },
      {
        name: 'Attendance',
        icon: 'fa-solid fa-clipboard-check',
        route: '/attendance',
        active: false
      },
      {
        name: 'Reports',
        icon: 'fa-solid fa-chart-line',
        route: '/reports',
        active: false
      },
      {
        name: 'Notifications',
        icon: 'fa-solid fa-bell',
        route: '/notifications',
        active: false
      },
      {
        name: 'Settings',
        icon: 'fa-solid fa-gear',
        route: '/settings',
        active: false
      }
  ]

  public activateSideBarItem(sideBarItem: any) {
    sideBarItem.active = true;
  }
}
