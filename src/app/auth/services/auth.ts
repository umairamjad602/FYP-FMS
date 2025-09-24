import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { baseAPIClass } from '../../core/class/base-api.class';
import { signUp } from '../../models/sign-up.model';

@Injectable({
  providedIn: 'root'
})
export class Auth extends baseAPIClass {
  constructor(private http: HttpClient) {
    super();
  }

  createUser(payload: signUp) {
    return this.http.post(`${this.baseUrl}/Users/register`, payload);
  }

  loginUser(payload: { email: string; password: string }) {
    return this.http.post<{ token: string }>(`${this.baseUrl}/Users/login`, payload).pipe(
      tap((response) => {
        if (response && response.token) {
          localStorage.setItem('authToken', response.token); // store token
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('authToken');
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
