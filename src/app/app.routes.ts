import { Routes } from '@angular/router';
import { SignIn } from './auth/sign-in/sign-in';
import { SignUp } from './auth/sign-up/sign-up';
import { AuthGuard } from './core/guards/auth.guard';
import { Layout } from './layout/layout/layout';
import { Members } from './components/member/members/members';
import { Trainers } from './components/trainer/create-update-trainer/trainers/trainers';
import { SubscriptionsPlans } from './components/subscriptions-plans/subscriptions-plans';
import { Attendance } from './components/attendance/attendance';
import { Reviews } from './components/member/reviews/reviews';
import { Profile } from './components/profile/profile';
import { WorkoutPlans } from './components/workout-plans/workout-plans';
import { DietPlans } from './components/diet-plans/diet-plans';
import { Progress } from './components/progress/progress';
import { Appointments } from './components/appointments/appointments';
import { PaymentSuccess} from './components/payment-success/payment-success';

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
      { path: 'members', component: Members },
      { path: '', redirectTo: 'members', pathMatch: 'full' },
      {
        path: 'members',
        component: Members
      },
      {
        path: 'members/:id',
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
        path: 'trainers/:id',
        component: Trainers
      },
      {
        path: 'subscriptions-plans',
        component: SubscriptionsPlans
      },
      {
        path: 'attendance',
        component: Attendance
      },
      {
        path: 'reviews',
        component: Reviews
      },
      {
        path: 'profile',
        component: Profile
      },
      {
        path: 'workout-plans',
        component: WorkoutPlans
      },
      {
        path: 'diet-plans',
        component: DietPlans
      },
      {
        path: 'progress',
        component: Progress
      },
      {
        path: 'appointments',
        component: Appointments
      },
      { path: 'payment-success', component: PaymentSuccess }
    ]
  },
  { 
    path: '**',
    redirectTo: 'members'  
  }
];
