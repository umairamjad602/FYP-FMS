import { Routes } from '@angular/router';
import { SignIn } from './auth/sign-in/sign-in';
import { SignUp } from './auth/sign-up/sign-up';
import { Dashboard } from './components/dashboard/dashboard';
import { AuthGuard } from './core/guards/auth.guard';
import { Layout } from './layout/layout/layout';
import { Members } from './components/members/members';
import { Trainers } from './components/trainers/trainers';
import { SubscriptionsPlans } from './components/subscriptions-plans/subscriptions-plans';
import { Payments } from './components/payments/payments';
import { Attendance } from './components/attendance/attendance';
import { Reports } from './components/reports/reports';
import { Notifications } from './components/notifications/notifications';
import { Settings } from './components/settings/settings';

export const routes: Routes = [
  {
    path: 'sign-in',
    component: SignIn
  },
  {
    path: 'sign-up',
    component: SignUp,
  },
  {
    path: '',
    component: Layout,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
      ,{
        path: 'members',
        component: Members
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'trainers',
        component: Trainers
      },
      {
        path: 'subscriptions-plans',
        component: SubscriptionsPlans
      },
      {
        path: 'payments',
        component: Payments
      },
      {
        path: 'attendance',
        component: Attendance
      },
      {
        path: 'reports',
        component: Reports
      },
      {
        path: 'notifications',
        component: Notifications
      },
      {
        path: 'settings',
        component: Settings
      },
    ]
  },
  { 
    path: '**',
    redirectTo: 'dashboard'  
  }
];
