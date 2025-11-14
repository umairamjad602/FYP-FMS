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

  // Get all diet plans (for members/admins)
  public async getDietPlansAsync() {
    return await firstValueFrom(this.httpClient.get(`${this.baseUrl}/DietPlans`));
  }

  // Get diet plans by specific trainer (for trainers)
  public async getDietPlansByTrainer(trainerId: number) {
    return await firstValueFrom(this.httpClient.get(`${this.baseUrl}/DietPlans/trainer/${trainerId}`));
  }

  // Get single diet plan by ID
  public async getDietPlanById(id: number) {
    return await firstValueFrom(this.httpClient.get(`${this.baseUrl}/DietPlans/${id}`));
  }
  public async getDietPlanByMember(id: number) {
    return await firstValueFrom(this.httpClient.get(`${this.baseUrl}/DietPlans/member/${id}`));
  }

  // Create new diet plan
  public async createDietPlan(payload: any) {
    return await firstValueFrom(this.httpClient.post(`${this.baseUrl}/DietPlans`, payload));
  }

  // Update existing diet plan
  public async updateDietPlan(id: number, updatedDietPlan: any) {
    return await firstValueFrom(this.httpClient.put(`${this.baseUrl}/DietPlans/${id}`, updatedDietPlan));
  }

  // Delete diet plan
  public async deleteDietPlan(id: number) {
    return await firstValueFrom(this.httpClient.delete(`${this.baseUrl}/DietPlans/${id}`));
  }

  // Assign diet plan to member
  public async assignDietToMember(payload: any) {
    return await firstValueFrom(this.httpClient.post(`${this.baseUrl}/DietPlans/assign`, payload));
  }

  // Unassign diet plan from member
  public async unassignDietFromMember(dietPlanId: number, memberId: number) {
    return await firstValueFrom(this.httpClient.delete(`${this.baseUrl}/DietPlans/unassign/${dietPlanId}/${memberId}`));
  }

  // Get assigned members for a diet plan
  public async getAssignedMembers(dietPlanId: number) {
    return await firstValueFrom(this.httpClient.get(`${this.baseUrl}/DietPlans/assigned-members/${dietPlanId}`));
  }

  // Get members assigned to a specific trainer (for assignment dropdown)
  public async getMembersByTrainer(trainerId: number) {
    return await firstValueFrom(this.httpClient.get(`${this.baseUrl}/DietPlans/trainer/${trainerId}/members`));
  }

  // Get diet plans with assignments info
  public async getDietPlansWithAssignments() {
    return await firstValueFrom(this.httpClient.get(`${this.baseUrl}/DietPlans/with-assignments`));
  }
}