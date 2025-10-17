import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { baseAPIClass } from '../../core/class/base-api.class';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MemberService extends baseAPIClass {
  constructor(private httpClient: HttpClient) {
    super()
  }

  public async createMember(payload: any) {
    return await firstValueFrom(this.httpClient.post(`${this.baseUrl}/Members/create`, payload));
}

public async getMembersAsync() {
  return await firstValueFrom(this.httpClient.get(`${this.baseUrl}/Members/get`));
}

public async updateMember(id:number, updatedMember: any) {
  return await firstValueFrom(this.httpClient.put(`${this.baseUrl}/Members/${id}`, updatedMember));
}

public async deleteMember(id:number) {
  return await firstValueFrom(this.httpClient.delete(`${this.baseUrl}/Members/${id}`))
}
}
