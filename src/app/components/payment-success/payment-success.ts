import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PlansService } from '../../services/plan/plans-service';
import { AppointmentService } from '../../services/appointments/appointment-service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-payment-success',
  imports: [CommonModule],
  templateUrl: './payment-success.html',
  styleUrl: './payment-success.scss'
})
export class PaymentSuccess implements OnInit {
  loading = true;
  success = false;
  error = false;
  successMessage = '';
  errorMessage = '';
  paymentDetails: any = null;
  paymentType: 'subscription' | 'renewal' | 'appointment' = 'subscription';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private planService: PlansService,
    private appointmentService: AppointmentService,
    private toastr: ToastrService
  ) {}

  async ngOnInit() {
    
    this.route.queryParams.subscribe(async params => {
      const sessionId = params['session_id'];
      const type = params['type']; 
      
      if (sessionId) {
        this.paymentType = type || 'subscription';
        await this.confirmPayment(sessionId);
      } else {
        this.handleError('No payment session found. Please contact support if this issue persists.');
      }
    });
  }

  async confirmPayment(sessionId: string) {
    try {
      this.loading = true;
      
      if (this.paymentType === 'subscription' || this.paymentType === 'renewal') {
        await this.confirmSubscriptionPayment(sessionId);
      } else {
        await this.confirmAppointmentPayment(sessionId);
      }
      
    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      this.handleError(error.error?.message || 'Payment confirmation failed. Please contact support.');
    }
  }

  async confirmSubscriptionPayment(sessionId: string) {
    const result = await this.planService.confirmStripePayment(sessionId);
    
    this.success = true;
    
    if (this.paymentType === 'renewal') {
      this.successMessage = result.message || 'Your membership renewal was successful!';
    } else {
      this.successMessage = result.message || 'Your payment was successful and membership has been activated!';
    }
    
    this.paymentDetails = result;
    this.loading = false;
    
    this.toastr.success('Payment completed successfully!', 'Success');
  }

  async confirmAppointmentPayment(sessionId: string) {
    const result = await this.appointmentService.confirmAppointmentPayment(sessionId);
    
    this.success = true;
    this.successMessage = result.message || 'Your appointment payment was successful!';
    this.paymentDetails = result;
    this.loading = false;
    
    this.toastr.success('Appointment payment completed successfully!', 'Success');
  }

  handleError(message: string) {
    this.error = true;
    this.errorMessage = message;
    this.loading = false;
    this.toastr.error(message, 'Payment Error');
  }

  goToSubscriptions() {
    this.router.navigate(['/subscriptions-plans']);
  }

  goToAppointments() {
    this.router.navigate(['/appointments']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getSuccessTitle(): string {
    switch (this.paymentType) {
      case 'appointment':
        return 'Appointment Booked!';
      case 'renewal':
        return 'Renewal Successful!';
      default:
        return 'Payment Successful!';
    }
  }

  getSuccessMessage(): string {
    switch (this.paymentType) {
      case 'appointment':
        return 'Your appointment has been confirmed and payment processed successfully.';
      case 'renewal':
        return 'Your membership has been renewed successfully.';
      default:
        return 'Your payment was successful and membership has been activated!';
    }
  }

  getPrimaryActionText(): string {
    switch (this.paymentType) {
      case 'appointment':
        return 'View Appointments';
      case 'renewal':
      case 'subscription':
      default:
        return 'View Membership';
    }
  }

  getPrimaryAction(): Function {
    switch (this.paymentType) {
      case 'appointment':
        return this.goToAppointments.bind(this);
      case 'renewal':
      case 'subscription':
      default:
        return this.goToSubscriptions.bind(this);
    }
  }

  getIconClass(): string {
    switch (this.paymentType) {
      case 'appointment':
        return 'fa-calendar-check';
      case 'renewal':
        return 'fa-sync-alt';
      default:
        return 'fa-id-card';
    }
  }

  getDetailsTitle(): string {
    switch (this.paymentType) {
      case 'appointment':
        return 'Appointment Details';
      case 'renewal':
        return 'Renewal Details';
      default:
        return 'Membership Details';
    }
  }
}