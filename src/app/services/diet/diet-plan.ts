import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { baseAPIClass } from '../../core/class/base-api.class';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DietPlanService extends baseAPIClass {
  constructor(private httpClient: HttpClient) {
    super()
  }

  
  public async getDietPlansAsync() {
    return await firstValueFrom(this.httpClient.get(`${this.baseUrl}/DietPlans`));
  }

  
  public async getDietPlansByTrainer(trainerId: number) {
    return await firstValueFrom(this.httpClient.get(`${this.baseUrl}/DietPlans/trainer/${trainerId}`));
  }

  
  public async getDietPlanById(id: number) {
    return await firstValueFrom(this.httpClient.get(`${this.baseUrl}/DietPlans/${id}`));
  }
  public async getDietPlanByMember(id: number) {
    return await firstValueFrom(this.httpClient.get(`${this.baseUrl}/DietPlans/member/${id}`));
  }

  
  public async createDietPlan(payload: any) {
    return await firstValueFrom(this.httpClient.post(`${this.baseUrl}/DietPlans`, payload));
  }

  
  public async updateDietPlan(id: number, updatedDietPlan: any) {
    return await firstValueFrom(this.httpClient.put(`${this.baseUrl}/DietPlans/${id}`, updatedDietPlan));
  }

  
  public async deleteDietPlan(id: number) {
    return await firstValueFrom(this.httpClient.delete(`${this.baseUrl}/DietPlans/${id}`));
  }

  
  public async assignDietToMember(payload: any) {
    return await firstValueFrom(this.httpClient.post(`${this.baseUrl}/DietPlans/assign`, payload));
  }

  
  public async unassignDietFromMember(dietPlanId: number, memberId: number) {
    return await firstValueFrom(this.httpClient.delete(`${this.baseUrl}/DietPlans/unassign/${dietPlanId}/${memberId}`));
  }

  
  public async getAssignedMembers(dietPlanId: number) {
    return await firstValueFrom(this.httpClient.get(`${this.baseUrl}/DietPlans/assigned-members/${dietPlanId}`));
  }

  
  public async getMembersByTrainer(trainerId: number) {
    return await firstValueFrom(this.httpClient.get(`${this.baseUrl}/DietPlans/trainer/${trainerId}/members`));
  }

  
  public async getDietPlansWithAssignments() {
    return await firstValueFrom(this.httpClient.get(`${this.baseUrl}/DietPlans/with-assignments`));
  }
}