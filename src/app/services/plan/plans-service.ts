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

  
  public async getMembershipPlans() {
    try {
      return await firstValueFrom(this.httpClient.get(`${this.baseUrl}/Membership/plans`));
    } catch (error) {
      console.error('Error fetching membership plans:', error);
      throw error;
    }
  }

  
  public async purchaseMembership(payload: { memberId: number; planId: number; paymentMethod: string }) {
    try {
      return await firstValueFrom(
        this.httpClient.post<{
          message: string;
          membershipId: number;
          status: string;
          endDate: string;
        }>(`${this.baseUrl}/Membership/purchase`, payload)
      );
    } catch (error) {
      console.error('Error purchasing membership:', error);
      throw error;
    }
  }

  
  public async renewMembership(payload: { memberId: number; membershipId: number; paymentMethod: string }) {
    try {
      return await firstValueFrom(
        this.httpClient.post<{
          message: string;
          renewalMembershipId: number;
          status: string;
          currentMembershipStatus: string;
          startDate: string;
          endDate: string;
          requiresPayment: boolean;
        }>(`${this.baseUrl}/Membership/renew`, payload)
      );
    } catch (error) {
      console.error('Error renewing membership:', error);
      throw error;
    }
  }

  
  public async getMemberStatus(memberId: number) {
    try {
      return await firstValueFrom(
        this.httpClient.get<{
          Status: string;
          CurrentMembership: any;
          LastRenewal: string;
        }>(`${this.baseUrl}/Membership/status/${memberId}`)
      );
    } catch (error) {
      console.error('Error fetching member status:', error);
      throw error;
    }
  }

  
  public async getMembershipHistory(memberId: number) {
    try {
      return await firstValueFrom(
        this.httpClient.get<any[]>(`${this.baseUrl}/Membership/history/${memberId}`)
      );
    } catch (error) {
      console.error('Error fetching membership history:', error);
      throw error;
    }
  }

  
  public async createPlan(payload: { 
    name: string; 
    duration: number; 
    price: number; 
    description: string; 
    features: string; 
  }) {
    try {
      return await firstValueFrom(
        this.httpClient.post<{ message: string; planId: number }>(
          `${this.baseUrl}/Membership/plans`, 
          payload
        )
      );
    } catch (error) {
      console.error('Error creating plan:', error);
      throw error;
    }
  }

  public async updatePlan(id: number, payload: { 
    name: string; 
    duration: number; 
    price: number; 
    description: string; 
    features: string; 
    isActive: boolean;
  }) {
    try {
      return await firstValueFrom(
        this.httpClient.put<{ message: string }>(
          `${this.baseUrl}/Membership/plans/${id}`, 
          payload
        )
      );
    } catch (error) {
      console.error('Error updating plan:', error);
      throw error;
    }
  }

  public async deletePlan(id: number) {
    try {
      return await firstValueFrom(
        this.httpClient.delete<{ message: string }>(
          `${this.baseUrl}/Membership/plans/${id}`
        )
      );
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw error;
    }
  }

  
  public async getPendingPayments() {
    try {
      return await firstValueFrom(
        this.httpClient.get<any[]>(`${this.baseUrl}/Membership/pending-payments`)
      );
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      throw error;
    }
  }

  
  public async updatePaymentStatus(payload: { paymentId: number; newStatus: string }) {
    try {
      return await firstValueFrom(
        this.httpClient.post<{ message: string }>(
          `${this.baseUrl}/Membership/update-payment-status`, 
          payload
        )
      );
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  
  public async updateMembershipStatus(payload: { membershipId: number; newStatus: string }) {
    try {
      return await firstValueFrom(
        this.httpClient.post<{ message: string }>(
          `${this.baseUrl}/Membership/update-membership-status`, 
          payload
        )
      );
    } catch (error) {
      console.error('Error updating membership status:', error);
      throw error;
    }
  }

  
  public async getBankDetails() {
    try {
      return await firstValueFrom(
        this.httpClient.get<any>(`${this.baseUrl}/Membership/bank-details`)
      );
    } catch (error) {
      console.error('Error fetching bank details:', error);
      throw error;
    }
  }

  public async saveBankDetails(payload: {
    accountHolder: string;
    accountNumber: string;
    bankName: string;
    branchCode: string;
    iban: string;
    swiftCode: string;
  }) {
    try {
      return await firstValueFrom(
        this.httpClient.post<{ message: string }>(
          `${this.baseUrl}/Membership/bank-details`, 
          payload
        )
      );
    } catch (error) {
      console.error('Error saving bank details:', error);
      throw error;
    }
  }

  
  public async createStripeSession(memberId: number, planId: number) {
    try {
      return await firstValueFrom(
        this.httpClient.post<{ sessionId: string }>(
          `${this.baseUrl}/Membership/create-payment-session`, 
          { memberId, planId }
        )
      );
    } catch (error) {
      console.error('Error creating Stripe session:', error);
      throw error;
    }
  }

  
  public async createRenewalPaymentSession(memberId: number, renewalMembershipId: number) {
    try {
      return await firstValueFrom(
        this.httpClient.post<{ sessionId: string }>(
          `${this.baseUrl}/Membership/create-renewal-payment-session`, 
          { memberId, renewalMembershipId }
        )
      );
    } catch (error) {
      console.error('Error creating renewal Stripe session:', error);
      throw error;
    }
  }

  public async confirmStripePayment(sessionId: string) {
    try {
      return await firstValueFrom(
        this.httpClient.post<{ 
          message: string; 
          membershipId: number; 
          status: string;
          endDate: string;
        }>(
          `${this.baseUrl}/Membership/confirm-stripe-payment`, 
          { sessionId }
        )
      );
    } catch (error) {
      console.error('Error confirming Stripe payment:', error);
      throw error;
    }
  }
}