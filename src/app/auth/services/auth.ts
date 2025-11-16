import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { baseAPIClass } from '../../core/class/base-api.class';
import { signUp } from '../../models/sign-up.model';
import { firstValueFrom } from 'rxjs';

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
    return this.http.post<{ token: string; role: string;}>(`${this.baseUrl}/Users/login`, payload).pipe(
      tap((response) => {
        if (response && response.token) {
          localStorage.setItem('authToken', response.token); // store token
          localStorage.setItem('role', response.role);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('role');
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
  public async getloggedInUserAsync() {
    const token = this.getToken();
    const headers = { 'Authorization': `Bearer ${token}` };
    return await firstValueFrom(
      this.http.get(`${this.baseUrl}/Users/profile`, { headers })
    );
  }
}
