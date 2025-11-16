import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { baseAPIClass } from '../../core/class/base-api.class';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlansService extends baseAPIClass {
  constructor(private httpClient: HttpClient) {
    super();
  }

  // Get all active membership plans
  public async getMembershipPlans() {
    return await firstValueFrom(this.httpClient.get(`${this.baseUrl}/Membership/plans`));
  }

  // Purchase a new membership
  public async purchaseMembership(payload: any) {
    return await firstValueFrom(this.httpClient.post(`${this.baseUrl}/Membership/purchase`, payload));
  }

  // Renew existing membership
  public async renewMembership(payload: any) {
    return await firstValueFrom(this.httpClient.post(`${this.baseUrl}/Membership/renew`, payload));
  }

  // Get member's current membership status
  public async getMemberStatus(memberId: number) {
    return await firstValueFrom(this.httpClient.get(`${this.baseUrl}/Membership/status/${memberId}`));
  }

  // Get member's membership history
  public async getMembershipHistory(memberId: number) {
    return await firstValueFrom(this.httpClient.get(`${this.baseUrl}/Membership/history/${memberId}`));
  }

  // Admin functions
  public async createPlan(payload: any) {
    return await firstValueFrom(this.httpClient.post(`${this.baseUrl}/Membership/plans`, payload));
  }

  public async updatePlan(id: number, payload: any) {
    return await firstValueFrom(this.httpClient.put(`${this.baseUrl}/Membership/plans/${id}`, payload));
  }

  public async deletePlan(id: number) {
    return await firstValueFrom(this.httpClient.delete(`${this.baseUrl}/Membership/plans/${id}`));
  }

  // Get pending payments (Admin only)
  public async getPendingPayments() {
    return await firstValueFrom(this.httpClient.get(`${this.baseUrl}/Membership/pending-payments`));
  }

  // Update payment status (Admin only)
  public async updatePaymentStatus(payload: any) {
    return await firstValueFrom(this.httpClient.post(`${this.baseUrl}/Membership/update-payment-status`, payload));
  }

  // Update membership status (Admin only)
  public async updateMembershipStatus(payload: any) {
    return await firstValueFrom(this.httpClient.post(`${this.baseUrl}/Membership/update-membership-status`, payload));
  }

  // Bank details functions
  public async getBankDetails() {
    return await firstValueFrom(this.httpClient.get(`${this.baseUrl}/Membership/bank-details`));
  }

  public async saveBankDetails(payload: any) {
    return await firstValueFrom(this.httpClient.post(`${this.baseUrl}/Membership/bank-details`, payload));
  }

  // STRIPE PAYMENT METHODS
  public async createStripeSession(memberId: number, planId: number) {
    return await firstValueFrom(
      this.httpClient.post<{ sessionId: string }>(
        `${this.baseUrl}/Membership/create-payment-session`, 
        { memberId, planId }
      )
    );
  }

  public async confirmStripePayment(sessionId: string) {
    return await firstValueFrom(
      this.httpClient.post<{ 
        message: string; 
        membershipId: number; 
        endDate: string;
      }>(
        `${this.baseUrl}/Membership/confirm-stripe-payment`, 
        { sessionId }
      )
    );
  }
}