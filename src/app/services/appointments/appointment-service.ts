import { Injectable } from '@angular/core';
import { baseAPIClass } from '../../core/class/base-api.class';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService extends baseAPIClass {
  constructor(
    private httpClient: HttpClient
  ) {
    super();
  }

  // Book appointment with trainer
  public async bookTrainer(payload: any) {
    return await firstValueFrom(
      this.httpClient.post(`${this.baseUrl}/Appointments/book-trainer`, payload)
    );
  }

  // Book fitness class
  public async bookClass(payload: any) {
    return await firstValueFrom(
      this.httpClient.post(`${this.baseUrl}/Appointments/book-class`, payload)
    );
  }

  // Get member's appointments
  public async getMemberAppointments(memberId: number) {
    return await firstValueFrom(
      this.httpClient.get(`${this.baseUrl}/Appointments/member/${memberId}`)
    );
  }

  // Cancel appointment
  public async cancelAppointment(appointmentId: number) {
    return await firstValueFrom(
      this.httpClient.put(`${this.baseUrl}/Appointments/cancel/${appointmentId}`, {})
    );
  }

  // Get available trainers
  public async getAvailableTrainers(date: string, time: string) {
    return await firstValueFrom(
      this.httpClient.get(`${this.baseUrl}/Appointments/available-trainers?date=${date}&time=${time}`)
    );
  }

  // Get upcoming classes
  public async getUpcomingClasses() {
    return await firstValueFrom(
      this.httpClient.get(`${this.baseUrl}/Appointments/upcoming-classes`)
    );
  }

  // FITNESS CLASSES CRUD OPERATIONS (from your combined controller)

  // Get all fitness classes
  public async getAllFitnessClasses() {
    return await firstValueFrom(
      this.httpClient.get(`${this.baseUrl}/Appointments`)
    );
  }

  // Get fitness class by ID
  public async getFitnessClassById(id: number) {
    return await firstValueFrom(
      this.httpClient.get(`${this.baseUrl}/Appointments/${id}`)
    );
  }

  // Create new fitness class
  public async createFitnessClass(payload: any) {
    return await firstValueFrom(
      this.httpClient.post(`${this.baseUrl}/Appointments`, payload)
    );
  }

  // Update fitness class
  public async updateFitnessClass(id: number, payload: any) {
    return await firstValueFrom(
      this.httpClient.put(`${this.baseUrl}/Appointments/${id}`, payload)
    );
  }

  // Delete fitness class
  public async deleteFitnessClass(id: number) {
    return await firstValueFrom(
      this.httpClient.delete(`${this.baseUrl}/Appointments/${id}`)
    );
  }

  // Get classes by trainer
  public async getClassesByTrainer(trainerId: number) {
    return await firstValueFrom(
      this.httpClient.get(`${this.baseUrl}/Appointments/trainer/${trainerId}`)
    );
  }
}