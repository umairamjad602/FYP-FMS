import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { baseAPIClass } from '../../core/class/base-api.class';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrainerService extends baseAPIClass {
  constructor(private httpClient: HttpClient) {
    super();
  }

  public async createTrainer(payload: any) {
    return await firstValueFrom(this.httpClient.post(`${this.baseUrl}/Trainers/create`, payload));
  }

  public async getTrainersAsync() {
    return await firstValueFrom(this.httpClient.get(`${this.baseUrl}/Trainers/get`));
  }

  public async updateTrainer(id: number, updatedTrainer: any) {
    return await firstValueFrom(this.httpClient.put(`${this.baseUrl}/Trainers/${id}`, updatedTrainer));
  }

  public async deleteTrainer(id: number) {
    return await firstValueFrom(this.httpClient.delete(`${this.baseUrl}/Trainers/${id}`));
  }
}
