import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlansService } from '../../services/plan/plans-service';
import { CommonModule } from '@angular/common';
import { Auth } from '../../auth/services/auth';
import { ToastrService } from 'ngx-toastr';
import { loadStripe } from '@stripe/stripe-js';
import { CalculateEndDatePipe } from "../../pipes/calculate-end-date-pipe-pipe";

@Component({
  selector: 'app-subscriptions-plans',
  imports: [CommonModule, ReactiveFormsModule, CalculateEndDatePipe],
  templateUrl: './subscriptions-plans.html',
  styleUrl: './subscriptions-plans.scss'
})
export class SubscriptionsPlans {
  loggedInUser: any;

  purchasePlanForm: FormGroup;
  createPlanForm: FormGroup;
  renewMembershipForm: FormGroup;
  bankDetailsForm: FormGroup;

  public plansList: any[] = [];
  public memberId: number = 0;
  public selectedPlanId: number | null = null;
  membershipHistoryList: any;
  selectedMembershipForRenew: any = null;

  public selectedPaymentMethod: string = '';
  public pendingPayments: any[] = [];
  public bankAccountDetails: any;

  // Stripe configuration
  private stripePublishableKey = 'pk_test_51SU39kK7gKal9maapfl9r23q6Y5XnUO6lkgglPEMfRRDmTYu4PTHfSmdMqHqIP75iogWeX2qm5TCmEQxm34iQcrt00PDrMzH7c';

  constructor(
    private formBuilder: FormBuilder,
    private planService: PlansService,
    private authService: Auth,
    private toastrService: ToastrService
  ) {
    this.initializeForms();
    this.getMemberId();
  }

  async ngOnInit() {
    await this.getMemberId();
    await this.inItForm();
    this.getPlans();
    if (this.loggedInUser?.role === 'Member') {
      this.getMembershipHistory();
      this.getMemberStatus();
      this.loadBankDetails();
    }
    if (this.loggedInUser?.role === 'Admin') {
      this.getPendingPayments();
      this.loadBankDetails();
    }
  }

  
  getSelectedPlanPrice(): number {
    if (!this.selectedPlanId) return 0;
    const plan = this.plansList.find(p => p.id === this.selectedPlanId);
    return plan ? plan.price : 0;
  }

  
  private initializeForms() {
    this.purchasePlanForm = this.formBuilder.group({
      memberId: [0],
      planId: [null],
      paymentMethod: ['']
    });

    this.createPlanForm = this.formBuilder.group({
      name: [''],
      duration: [0],
      price: [0],
      description: [''],
      features: ['']
    });

    this.renewMembershipForm = this.formBuilder.group({
      memberId: [0, [Validators.required]],
      membershipId: [null, [Validators.required]],
      paymentMethod: ['', [Validators.required]]
    });

    this.bankDetailsForm = this.formBuilder.group({
      accountHolder: [''],
      accountNumber: [''],
      bankName: [''],
      branchCode: [''],
      iban: [''],
      swiftCode: ['']
    });
  }

  // MAIN PURCHASE METHOD
  public async purchaseMembership() {
    if (!this.selectedPlanId) {
      this.toastrService.error('Please select a plan first');
      return;
    }

    if (!this.selectedPaymentMethod) {
      this.toastrService.error('Please select a payment method');
      return;
    }

    try {
      if (this.selectedPaymentMethod === 'Card') {
        
        await this.processStripePayment();
      } else {
        
        await this.processRegularPayment();
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      this.toastrService.error(error.error?.message || 'Payment failed. Please try again.');
    }
  }

  
  public async processStripePayment() {
    try {
      const sessionResult = await this.planService.createStripeSession(
        this.memberId,
        this.selectedPlanId!
      );

      const stripe = await loadStripe(this.stripePublishableKey);

      if (!stripe) {
        this.toastrService.error('Failed to initialize payment system');
        return;
      }

      
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionResult.sessionId
      });

      if (error) {
        this.toastrService.error(error.message || 'Payment redirect failed');
      }

    } catch (error: any) {
      console.error('Stripe payment error:', error);
      this.toastrService.error(error.error?.message || 'Failed to process payment');
      throw error;
    }
  }

  
  private async processRegularPayment() {
    try {
      const result = await this.planService.purchaseMembership({
        memberId: this.memberId,
        planId: this.selectedPlanId!,
        paymentMethod: this.selectedPaymentMethod
      });

      this.toastrService.success('💰 ' + result.message);

      
      this.resetForm();

      
      await this.refreshMemberData();

    } catch (error: any) {
      console.error('Regular payment error:', error);
      this.toastrService.error(error.error?.message || 'Payment failed');
      throw error;
    }
  }

  
  public async renewMembership() {
    
    this.renewMembershipForm.markAllAsTouched();

    if (this.renewMembershipForm.invalid) {
      this.toastrService.error('Please select a payment method for renewal');
      return;
    }

    try {
      const payload = this.renewMembershipForm.value;
      console.log('Renew payload:', payload);
      
      const result: any = await this.planService.renewMembership(payload);
      this.toastrService.success(result.message);

      
      if (payload.paymentMethod === 'Card' && result.requiresPayment) {
        console.log('Processing Stripe payment for renewal...');
        await this.processRenewalStripePayment(result.renewalMembershipId);
      } else {
        
        console.log('No Stripe payment required, refreshing data...');
        this.cancelRenew();
        await this.refreshMemberData();
      }
    } catch (error: any) {
      console.error('Renew error:', error);
      this.toastrService.error(error.error?.message || 'Renewal failed');
    }
  }

  
  private async processRenewalStripePayment(renewalMembershipId: number) {
    try {
      console.log('Creating Stripe session for renewal:', renewalMembershipId);
      
      const sessionResult = await this.planService.createRenewalPaymentSession(
        this.memberId,
        renewalMembershipId
      );

      const stripe = await loadStripe(this.stripePublishableKey);

      if (!stripe) {
        this.toastrService.error('Failed to initialize payment system');
        return;
      }

      console.log('Redirecting to Stripe checkout...');
      
      
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionResult.sessionId
      });

      if (error) {
        console.error('Stripe redirect error:', error);
        this.toastrService.error(error.message || 'Payment redirect failed');
      } else {
        
        console.log('Stripe redirect successful');
      }

    } catch (error: any) {
      console.error('Stripe renewal payment error:', error);
      this.toastrService.error(error.error?.message || 'Failed to process renewal payment');
    }
  }

  
  selectMembershipForRenew(membership: any) {
    
    if (membership.status?.startsWith('Renewal')) {
      this.toastrService.warning('This membership already has a renewal request');
      return;
    }

    if (membership.status === 'Renewed') {
      this.toastrService.warning('This membership has already been renewed');
      return;
    }

    this.selectedMembershipForRenew = membership;
    
    
    this.renewMembershipForm.patchValue({
      memberId: this.memberId,
      membershipId: membership.id,
      paymentMethod: '' // Reset payment method
    });
  }

  // CANCEL RENEW
  cancelRenew() {
    this.selectedMembershipForRenew = null;
    this.renewMembershipForm.patchValue({
      memberId: this.memberId,
      membershipId: null,
      paymentMethod: ''
    });
  }

  // PAYMENT CONFIRMATION AFTER REDIRECT
  public async handlePaymentRedirect() {
    // This method should be called from your payment-success component
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
      try {
        const result = await this.planService.confirmStripePayment(sessionId);

        if (result.status === 'Active') {
          this.toastrService.success('✅ ' + result.message);

          
          await this.refreshMemberData();

          
          this.resetForm();
        }
      } catch (error: any) {
        console.error('Payment confirmation error:', error);
        this.toastrService.error('Payment confirmation failed');
      }
    }
  }

  
  public async createPlan() {
    try {
      const payload = this.createPlanForm.value;

      if (this.selectedPlanId) {
        await this.planService.updatePlan(this.selectedPlanId, payload);
        this.toastrService.success('Plan updated successfully');
      } else {
        await this.planService.createPlan(payload);
        this.toastrService.success('Plan created successfully');
      }

      
      await this.getPlans();

      
      this.createPlanForm.reset();
      this.selectedPlanId = null;

    } catch (error: any) {
      console.error('Create plan error:', error);
      this.toastrService.error(error.error?.message || 'Failed to save plan');
    }
  }

  
  public async deletePlan(planId: number) {
    if (confirm('Are you sure you want to delete this plan?')) {
      try {
        await this.planService.deletePlan(planId);
        this.toastrService.success('Plan deleted successfully');

        
        await this.getPlans();

        
        this.selectedPlanId = null;
        this.createPlanForm.reset();
      } catch (error: any) {
        console.error('Delete plan error:', error);
        this.toastrService.error(error.error?.message || 'Failed to delete plan');
      }
    }
  }

  
  async updatePaymentStatus(paymentId: number, newStatus: string) {
    try {
      await this.planService.updatePaymentStatus({
        paymentId: paymentId,
        newStatus: newStatus
      });

      this.toastrService.success('Payment status updated successfully');

      
      await this.getPendingPayments();

      if (this.loggedInUser?.role === 'Member') {
        await this.refreshMemberData();
      }
    } catch (error: any) {
      console.error('Update payment status error:', error);
      this.toastrService.error(error.error?.message || 'Failed to update payment status');
    }
  }

  
  async saveBankDetails() {
    try {
      await this.planService.saveBankDetails(this.bankDetailsForm.value);
      this.toastrService.success('Bank details updated successfully');
      await this.loadBankDetails();
    } catch (error: any) {
      console.error('Save bank details error:', error);
      this.toastrService.error(error.error?.message || 'Failed to save bank details');
    }
  }

  

  private resetForm() {
    this.selectedPaymentMethod = '';
    this.selectedPlanId = null;
    this.purchasePlanForm.patchValue({
      paymentMethod: '',
      planId: null
    });
  }

  private async refreshMemberData() {
    await this.getMembershipHistory();
    await this.getMemberStatus();
  }

  // ========== FORM INITIALIZATION ==========

  private async inItForm() {
    // Update form values with current member ID
    this.purchasePlanForm.patchValue({ memberId: this.memberId });
    this.renewMembershipForm.patchValue({ memberId: this.memberId });
  }

  // ========== OTHER METHODS ==========

  async loadBankDetails() {
    try {
      const response = await this.planService.getBankDetails();
      this.bankAccountDetails = response;

      if (response && Object.keys(response).length > 0) {
        this.bankDetailsForm.patchValue(response);
      }
    } catch (error) {
      console.error('Error loading bank details:', error);
      this.bankAccountDetails = {};
    }
  }

  onPaymentMethodChange(method: string) {
    this.selectedPaymentMethod = method;
    this.purchasePlanForm.patchValue({ paymentMethod: method });
  }

  async getPendingPayments() {
    try {
      const response = await this.planService.getPendingPayments();
      this.pendingPayments = response;
    } catch (error) {
      console.error('Error fetching pending payments:', error);
    }
  }

  async updateMembershipStatus(membershipId: number, newStatus: string) {
    try {
      await this.planService.updateMembershipStatus({
        membershipId: membershipId,
        newStatus: newStatus
      });
      this.toastrService.success('Membership status updated successfully');
    } catch (error: any) {
      console.error('Update membership status error:', error);
      this.toastrService.error(error.error?.message || 'Failed to update membership status');
    }
  }

  public async getMemberStatus() {
    try {
      const response = await this.planService.getMemberStatus(this.memberId);
      console.log('Member status:', response);
    } catch (error) {
      console.error('Error fetching member status:', error);
    }
  }

  public async getMembershipHistory() {
    try {
      const response = await this.planService.getMembershipHistory(this.memberId);
      this.membershipHistoryList = response;
    } catch (error) {
      console.error('Error loading membership history:', error);
    }
  }

  selectPlan(planId: number) {
    this.selectedPlanId = planId;
    this.purchasePlanForm.patchValue({ planId: planId });
  }

  updatePlan(planId: number, plan: any) {
    this.selectedPlanId = planId;
    this.createPlanForm.setValue({
      name: plan.name,
      duration: plan.duration,
      price: plan.price,
      description: plan.description,
      features: plan.features
    });
  }

  public async getPlans() {
    try {
      const plans: any = await this.planService.getMembershipPlans();
      this.plansList = plans;
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  }

  private async getMemberId() {
    try {
      const loggedInUser: any = await this.authService.getloggedInUserAsync();
      this.loggedInUser = loggedInUser;
      if (loggedInUser?.role === 'Member') {
        this.memberId = loggedInUser.id;
      }
    } catch (error) {
      console.error('Error getting member ID:', error);
    }
  }
}