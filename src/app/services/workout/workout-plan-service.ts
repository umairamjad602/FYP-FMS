import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { baseAPIClass } from '../../core/class/base-api.class';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkoutPlanService extends baseAPIClass {
  constructor(private httpClient: HttpClient) {
    super()
  }

  public async createWorkoutPlan(payload: any) {
    return await firstValueFrom(this.httpClient.post(`${this.baseUrl}/WorkoutPlans/create`, payload));
  }

  public async getWorkoutPlansAsync() {
    return await firstValueFrom(this.httpClient.get(`${this.baseUrl}/WorkoutPlans/get`));
  }

  public async getWorkoutPlansByTrainer(trainerId: number) {
    return await firstValueFrom(this.httpClient.get(`${this.baseUrl}/WorkoutPlans/trainer/${trainerId}`));
  }

  public async getWorkoutPlansByMember(memberId: number) {
    return await firstValueFrom(this.httpClient.get(`${this.baseUrl}/WorkoutPlans/member/${memberId}`));
  }

  public async updateWorkoutPlan(id: number, updatedWorkoutPlan: any) {
    return await firstValueFrom(this.httpClient.put(`${this.baseUrl}/WorkoutPlans/${id}`, updatedWorkoutPlan));
  }

  public async deleteWorkoutPlan(id: number) {
    return await firstValueFrom(this.httpClient.delete(`${this.baseUrl}/WorkoutPlans/${id}`));
  }

  public async assignWorkoutToMember(payload: any) {
    return await firstValueFrom(this.httpClient.post(`${this.baseUrl}/WorkoutPlans/assign`, payload));
  }

  public async unassignWorkoutFromMember(workoutPlanId: number, memberId: number) {
    return await firstValueFrom(this.httpClient.delete(`${this.baseUrl}/WorkoutPlans/unassign/${workoutPlanId}/${memberId}`));
  }

  public async getWorkoutAssignments(workoutPlanId: number) {
    return await firstValueFrom(this.httpClient.get(`${this.baseUrl}/WorkoutPlans/assignments/${workoutPlanId}`));
  }

  // FIXED: Updated to use the new endpoint
  public async getMembersByTrainer(trainerId: number) {
    return await firstValueFrom(this.httpClient.get(`${this.baseUrl}/WorkoutPlans/trainer/${trainerId}/members`));
  }
}