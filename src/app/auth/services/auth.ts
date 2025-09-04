import { Injectable } from '@angular/core';
import { baseAPIClass} from '../../core/class/base-api.class';
import { HttpClient } from '@angular/common/http';
import { signUp } from '../../models/sign-up.model';

@Injectable({
  providedIn: 'root'
})
export class Auth extends baseAPIClass {
 constructor(
  private http: HttpClient
 ){
  super();
 } 

 createUser(payload: signUp) {
  return this.http.post(`${this.baseUrl}/Users/register`, payload);
 } 

 loginUser(payload: { email: string; password: string }) {
  return this.http.post(`${this.baseUrl}/Users/login`, payload, {
    responseType: 'text'
  });
}

}
