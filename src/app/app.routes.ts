import { Routes } from '@angular/router';
import { SignIn } from './auth/sign-in/sign-in';
import { SignUp } from './auth/sign-up/sign-up';
import { Dashboard } from './components/dashboard/dashboard';

export const routes: Routes = [
    {
        path: 'sign-in',
        component: SignIn
    },
    {
        path: 'sign-up',
        component: SignUp
    },
    {
        path: 'dashboard',
        component: Dashboard
    }
    ,
    {
        path: '',
        component: SignIn,
        pathMatch: 'full'
    }
];
