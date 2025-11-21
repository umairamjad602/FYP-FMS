import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Auth } from '../../auth/services/auth';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.scss'
})
export class SideBar implements OnInit {

  public sideBarItems: any[] = [];
  public role: string | null = '';
  public userName: string = '';

  constructor(private authService: Auth) { }

  ngOnInit(): void {
    this.role = localStorage.getItem('role');
    this.userName = this.role ?? 'User';
    this.loadSidebarItems();
  }

  public logout() {
    this.authService.logout();
    window.location.reload();
  }

  private loadSidebarItems(): void {
    switch (this.role) {

      case 'Admin':
        this.sideBarItems = [
          { name: 'Members', icon: 'fa-solid fa-users', route: '/members' },
          { name: 'Trainers', icon: 'fa-solid fa-user-tie', route: '/trainers' },
          { name: 'Plans', icon: 'fa-solid fa-list-check', route: '/subscriptions-plans' },
          { name: 'Appointments', icon: 'fa-solid fa-calendar-check', route: '/appointments' },
        ];
        break;

      case 'Trainer':
        this.sideBarItems = [
          { name: 'Workout Plans', icon: 'fa-solid fa-dumbbell', route: '/workout-plans' },
          { name: 'Diet Plans', icon: 'fa-solid fa-apple-whole', route: '/diet-plans' },
          { name: 'Appointments', icon: 'fa-solid fa-calendar-check', route: '/appointments' },
          { name: 'Attendance', icon: 'fa-solid fa-clipboard-check', route: '/attendance' }
        ];
        break;

      case 'Member':
        this.sideBarItems = [
          { name: 'My Profile', icon: 'fa-solid fa-user', route: '/profile' },
          { name: 'Membership Plan', icon: 'fa-solid fa-list-check', route: '/subscriptions-plans' },
          { name: 'Workout Plan', icon: 'fa-solid fa-dumbbell', route: '/workout-plans' },
          { name: 'Diet Plan', icon: 'fa-solid fa-apple-whole', route: '/diet-plans' },
          { name: 'Progress', icon: 'fa-solid fa-chart-line', route: '/progress' },
          { name: 'Book Appointment', icon: 'fa-solid fa-calendar-plus', route: '/appointments' },
          { name: 'Reviews', icon: 'fa-solid fa-star', route: '/reviews' }
        ];
        break;

      
      default:
        this.sideBarItems = [
          { name: 'Dashboard', icon: 'fa-solid fa-house', route: '/dashboard' }
        ];
        break;
    }
  }
}
