import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export abstract class baseAPIClass {
 protected baseUrl = 'http://localhost:5108/api'; 
}
