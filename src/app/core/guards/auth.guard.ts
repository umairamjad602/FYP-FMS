import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) { }

  private checkAuth(): boolean | UrlTree {
    const token = localStorage.getItem('authToken');
    return token ? true : this.router.parseUrl('/sign-in');
  }

  canActivate(): boolean | UrlTree {
    return this.checkAuth();
  }

  canActivateChild(): boolean | UrlTree {
    return this.checkAuth();
  }
}
