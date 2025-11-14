import { Injectable } from '@angular/core';
import { baseAPIClass } from '../../core/class/base-api.class';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService extends baseAPIClass {
  constructor(
    private httpClient: HttpClient
  ) {
    super();
  }

  public async markAttendance(payload: any) {
    return await firstValueFrom(this.httpClient.post(`${this.baseUrl}/Attendance/mark`, payload))
  }

  public async getAttendanceHistory(){
    return await firstValueFrom(this.httpClient.get(`${this.baseUrl}/Attendance`))
  }
}
