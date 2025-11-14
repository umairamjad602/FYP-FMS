import { Injectable } from '@angular/core';
import { baseAPIClass } from '../../core/class/base-api.class';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProgressService extends baseAPIClass {
  constructor(
    private httpClient: HttpClient
  ){super();}

  public async createProgress(payload: any) {
    return firstValueFrom(this.httpClient.post(`${this.baseUrl}/Progress/create`, payload));
  }

  public async getProgressHistory() {
    return firstValueFrom(this.httpClient.get(`${this.baseUrl}/Progress`));
  }
}
