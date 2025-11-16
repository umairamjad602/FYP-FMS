import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PlansService } from '../../services/plan/plans-service';
import { CommonModule } from '@angular/common';
import { Auth } from '../../auth/services/auth';
import { ToastrService } from 'ngx-toastr';
import { loadStripe } from '@stripe/stripe-js';

@Component({
  selector: 'app-subscriptions-plans',
  imports: [CommonModule, ReactiveFormsModule],
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
  public memberId: number;
  public selectedPlanId: number | null;
  membershipHistoryList: any;
  selectedMembershipForRenew: any;

  public selectedPaymentMethod: string = '';
  public pendingPayments: any[] = [];
  public bankAccountDetails: any;

  // Stripe configuration - replace with your actual publishable key
  private stripePublishableKey = 'pk_test_51SU39kK7gKal9maapfl9r23q6Y5XnUO6lkgglPEMfRRDmTYu4PTHfSmdMqHqIP75iogWeX2qm5TCmEQxm34iQcrt00PDrMzH7c';

  constructor(
    private formBuilder: FormBuilder,
    private planService: PlansService,
    private authService: Auth,
    private toastrService: ToastrService
  ) {
    this.getMemberId();
  }

  async ngOnInit() {
    await this.getMemberId();
    await this.inItForm();
    this.getPlans();
    if (this.loggedInUser.role === 'Member') {
      this.getMembershipHistory();
      this.getMemberStatus();
      this.loadBankDetails();
    }
    if (this.loggedInUser.role === 'Admin') {
      this.getPendingPayments();
      this.loadBankDetails();
    }
  }

  // NEW: Process Stripe Payment - UPDATED FOR STRIPE.JS v8.4.0
  // In your component
  // In your component - REPLACE the processStripePayment method with this:
  async processStripePayment() {
    if (!this.selectedPlanId) {
      this.toastrService.error('Please select a plan first');
      return;
    }

    try {
      // Create Stripe session
      const sessionResult: any = await this.planService.createStripeSession(
        this.memberId,
        this.selectedPlanId
      );

      // Load Stripe
      const stripe = await loadStripe(this.stripePublishableKey);

      if (!stripe) {
        this.toastrService.error('Failed to initialize payment system');
        return;
      }

      // Use redirectToCheckout with the session ID
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionResult.sessionId
      });

      if (error) {
        this.toastrService.error(error.message || 'Payment redirect failed');
      }
    } catch (error: any) {
      console.error('Stripe payment error:', error);
      this.toastrService.error(error.error?.message || 'Failed to process payment');
    }
  }
  // Alternative method if above still doesn't work
  async processStripePaymentAlternative() {
    if (!this.selectedPlanId) {
      this.toastrService.error('Please select a plan first');
      return;
    }

    try {
      // Create Stripe session
      const sessionResult: any = await this.planService.createStripeSession(
        this.memberId,
        this.selectedPlanId
      );

      // For v8.4.0, you can also redirect manually
      window.location.href = sessionResult.url; // If your backend returns the URL

      // OR use the sessionId to redirect to Stripe
      // window.location.href = `https://checkout.stripe.com/pay/${sessionResult.sessionId}`;

    } catch (error: any) {
      console.error('Stripe payment error:', error);
      this.toastrService.error(error.error?.message || 'Failed to process payment');
    }
  }

  // NEW: Confirm Stripe Payment after redirect (call this in your payment-success component)
  async confirmStripePayment(sessionId: string) {
    try {
      const result: any = await this.planService.confirmStripePayment(sessionId);
      this.toastrService.success('✅ ' + result.message);

      // Refresh membership data
      this.getMembershipHistory();
      this.getMemberStatus();

      // Reset selection
      this.selectedPlanId = null;
      this.selectedPaymentMethod = '';
    } catch (error: any) {
      this.toastrService.error('Payment confirmation failed');
    }
  }

  // EXISTING: Process regular payment (Cash/Bank Transfer)
  async processRegularPayment() {
    if (!this.selectedPlanId || !this.selectedPaymentMethod) {
      this.toastrService.error('Please select a plan and payment method');
      return;
    }

    try {
      const result: any = await this.planService.purchaseMembership({
        memberId: this.memberId,
        planId: this.selectedPlanId,
        paymentMethod: this.selectedPaymentMethod
      });

      this.toastrService.success('💰 ' + result.message);

      // Reset form
      this.selectedPaymentMethod = '';
      this.selectedPlanId = null;
      this.purchasePlanForm.patchValue({
        paymentMethod: '',
        planId: null
      });

      // Refresh data
      this.getMembershipHistory();
      this.getMemberStatus();

    } catch (error: any) {
      this.toastrService.error(error.error || 'Payment failed');
    }
  }

  // EXISTING: Purchase membership (now handles both Stripe and regular payments)
  public async purchaseMembership() {
    if (this.selectedPaymentMethod === 'Card') {
      // Use Stripe for card payments
      await this.processStripePayment();
    } else {
      // Use regular payment for Cash/Bank Transfer
      await this.processRegularPayment();
    }
  }

  // EXISTING METHODS (ALL REMAIN UNCHANGED)
  private initBankDetailsForm() {
    this.bankDetailsForm = this.formBuilder.group({
      accountHolder: [''],
      accountNumber: [''],
      bankName: [''],
      branchCode: [''],
      iban: [''],
      swiftCode: ['']
    });
  }

  async loadBankDetails() {
    try {
      const response: any = await this.planService.getBankDetails();
      this.bankAccountDetails = response;
      console.log(response, 'bank details response');

      if (response && Object.keys(response).length > 0) {
        this.bankDetailsForm.patchValue(response);
      } else {
        console.log('No bank details found - using empty form');
      }
    } catch (error) {
      console.error('Error loading bank details:', error);
      this.bankAccountDetails = {};
    }
  }

  saveBankDetails() {
    this.planService.saveBankDetails(this.bankDetailsForm.value).then(() => {
      this.toastrService.success('Bank details updated successfully');
      this.loadBankDetails();
    }).catch(error => {
      this.toastrService.error('Failed to save bank details');
    });
  }

  private inItForm() {
    this.purchasePlansForm();
    this.createPlansForm();
    this.inItRenewForm();
    this.initBankDetailsForm();
  }

  public async inItRenewForm() {
    this.renewMembershipForm = this.formBuilder.group({
      memberId: [],
      membershipId: [],
      paymentMethod: []
    }),
      this.renewMembershipForm.patchValue({ memberId: this.memberId });
  }

  onPaymentMethodChange(method: string) {
    this.selectedPaymentMethod = method;
    this.purchasePlanForm.patchValue({ paymentMethod: method });
  }

  async getPendingPayments() {
    try {
      const response: any = await this.planService.getPendingPayments();
      this.pendingPayments = response;
    } catch (error) {
      console.error('Error fetching pending payments:', error);
    }
  }

  async updatePaymentStatus(paymentId: number, newStatus: string) {
    try {
      await this.planService.updatePaymentStatus({
        paymentId: paymentId,
        newStatus: newStatus
      });
      this.toastrService.success('Payment status updated successfully');
      this.getPendingPayments();

      if (this.loggedInUser.role === 'Member') {
        this.getMembershipHistory();
        this.getMemberStatus();
      }
    } catch (error: any) {
      this.toastrService.error(error.error || 'Failed to update payment status');
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
      this.toastrService.error(error.error || 'Failed to update membership status');
    }
  }

  selectMembershipForRenew(membership: any) {
    this.selectedMembershipForRenew = membership;
    this.renewMembershipForm.patchValue({
      memberId: this.memberId,
      membershipId: membership.id,
      paymentMethod: ''
    });
  }

  cancelRenew() {
    this.selectedMembershipForRenew = null;
    this.renewMembershipForm.reset();
    this.renewMembershipForm.patchValue({ memberId: this.memberId });
  }

  public async renewMembership() {
    try {
      const payload = this.renewMembershipForm.value;
      const result: any = await this.planService.renewMembership(payload);
      this.toastrService.success(result.message);

      this.cancelRenew();
      this.getMembershipHistory();
      this.getMemberStatus();
    } catch (error: any) {
      console.log(error.error);
      this.toastrService.error(error.error);
    }
  }

  public async getMemberStatus() {
    const response = await this.planService.getMemberStatus(this.memberId);
  }

  public async getMembershipHistory() {
    try {
      const response: any = await this.planService.getMembershipHistory(this.memberId);
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

  createPlansForm() {
    this.createPlanForm = this.formBuilder.group({
      name: [''],
      duration: [],
      price: [],
      description: [''],
      features: ['']
    })
  }

  public createPlan() {
    try {
      const payload = this.createPlanForm.value;
      this.planService.createPlan(payload);
      if (this.selectedPlanId) {
        this.planService.updatePlan(this.selectedPlanId, payload);
      }
      window.location.reload();
    }
    catch (error: any) {
      console.log(error);
    }
  }

  deletePlan(planId: number) {
    this.planService.deletePlan(planId);
    this.getPlans();
    window.location.reload();
  }

  public async getPlans() {
    const plans: any = await this.planService.getMembershipPlans();
    this.plansList = plans;
  }

  private async getMemberId() {
    const loggedInUser: any = await this.authService.getloggedInUserAsync();
    this.loggedInUser = loggedInUser;
    if (loggedInUser.role === 'Member') {
      this.memberId = loggedInUser.id;
    }
  }

  private purchasePlansForm() {
    this.purchasePlanForm = this.formBuilder.group({
      memberId: [],
      planId: [],
      paymentMethod: []
    }),
      this.purchasePlanForm.patchValue({ memberId: this.memberId });
  }
}