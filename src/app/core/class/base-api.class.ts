import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export abstract class baseAPIClass {
 protected baseUrl = 'https://localhost:7229/api'; 
}
