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

  
  public async bookTrainer(payload: any) {
    return await firstValueFrom(
      this.httpClient.post(`${this.baseUrl}/Appointments/book-trainer`, payload)
    );
  }

  
  public async bookClass(payload: any) {
    return await firstValueFrom(
      this.httpClient.post(`${this.baseUrl}/Appointments/book-class`, payload)
    );
  }

  
  public async getMemberAppointments(memberId: number) {
    return await firstValueFrom(
      this.httpClient.get(`${this.baseUrl}/Appointments/member/${memberId}`)
    );
  }

  
  public async cancelAppointment(appointmentId: number) {
    return await firstValueFrom(
      this.httpClient.put(`${this.baseUrl}/Appointments/cancel/${appointmentId}`, {})
    );
  }

  
  public async getAvailableTrainers(date: string, time: string) {
    return await firstValueFrom(
      this.httpClient.get(`${this.baseUrl}/Appointments/available-trainers?date=${date}&time=${time}`)
    );
  }

  
  public async getUpcomingClasses() {
    return await firstValueFrom(
      this.httpClient.get(`${this.baseUrl}/Appointments/upcoming-classes`)
    );
  }

  

  
  public async getAllFitnessClasses() {
    return await firstValueFrom(
      this.httpClient.get(`${this.baseUrl}/Appointments`)
    );
  }

  
  public async getFitnessClassById(id: number) {
    return await firstValueFrom(
      this.httpClient.get(`${this.baseUrl}/Appointments/${id}`)
    );
  }

  
  public async createFitnessClass(payload: any) {
    return await firstValueFrom(
      this.httpClient.post(`${this.baseUrl}/Appointments`, payload)
    );
  }

  
  public async updateFitnessClass(id: number, payload: any) {
    return await firstValueFrom(
      this.httpClient.put(`${this.baseUrl}/Appointments/${id}`, payload)
    );
  }

  
  public async deleteFitnessClass(id: number) {
    return await firstValueFrom(
      this.httpClient.delete(`${this.baseUrl}/Appointments/${id}`)
    );
  }

  
  public async getClassesByTrainer(trainerId: number) {
    return await firstValueFrom(
      this.httpClient.get(`${this.baseUrl}/Appointments/trainer/${trainerId}`)
    );
  }

  

  
  public async createTrainerPaymentSession(memberId: number, appointmentId: number) {
    return await firstValueFrom(
      this.httpClient.post<{ sessionId: string }>(
        `${this.baseUrl}/Appointments/create-trainer-payment-session`,
        { memberId, appointmentId }
      )
    );
  }

  
  public async createClassPaymentSession(memberId: number, appointmentId: number) {
    return await firstValueFrom(
      this.httpClient.post<{ sessionId: string }>(
        `${this.baseUrl}/Appointments/create-class-payment-session`,
        { memberId, appointmentId }
      )
    );
  }

  
  public async processAppointmentPayment(payload: {
    memberId: number;
    appointmentId: number;
    paymentMethod: string;
  }) {
    return await firstValueFrom(
      this.httpClient.post<{
        message: string;
        paymentId: number;
      }>(
        `${this.baseUrl}/Appointments/process-appointment-payment`,
        payload
      )
    );
  }

  
  public async confirmAppointmentPayment(sessionId: string) {
    return await firstValueFrom(
      this.httpClient.post<{
        message: string;
        appointmentId: number;
        status: string;
      }>(
        `${this.baseUrl}/Appointments/confirm-appointment-payment`,
        { sessionId }
      )
    );
  }

  getPendingPayments(){
    return firstValueFrom(this.httpClient.get(`${this.baseUrl}/Appointments/pending-payments`));
  }

  updatePaymentStatus(request: { paymentId: number, newStatus: string }) {
    return firstValueFrom(this.httpClient.post(`${this.baseUrl}/Appointments/update-payment-status`, request));
  }

}