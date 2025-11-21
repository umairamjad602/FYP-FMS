import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../services/appointments/appointment-service';
import { TrainerService } from '../trainer/trainer-service';
import { Auth } from '../../auth/services/auth';
import { loadStripe } from '@stripe/stripe-js';

@Component({
  selector: 'app-appointments',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './appointments.html',
  styleUrl: './appointments.scss'
})
export class Appointments implements OnInit {
  
  bookTrainerForm: FormGroup;
  bookClassForm: FormGroup;
  createClassForm: FormGroup;
  
  upcomingClasses: any = [];
  availableTrainers: any = [];
  memberAppointments: any = [];
  allFitnessClasses: any = [];
  allTrainers: any = [];
  public userData: any = [];
  selectedClass: any = null;
  pendingPayments: any[] = [];

  
  public activeTab: string = 'book-trainer';
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  public userId: number;
  public userRole: string;
  selectedAppointmentForPayment: any;
  selectedPaymentMethod: string;
  showPaymentModal: boolean;
  appointments: any;

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private trainerService: TrainerService,
    private authService: Auth
  ) {
    this.bookTrainerForm = this.createBookTrainerForm();
    this.bookClassForm = this.createBookClassForm();
    this.createClassForm = this.createClassFormForm();
  }

  async ngOnInit() {
    await this.getProfile();
    await this.getTrainerAppointments()
    this.setInitialTab();
    this.updateFormsWithUserId();
    this.loadInitialData();
    this.setupFormListeners();
  }

  async getTrainerAppointments() {
    const response =  await this.appointmentService.getTrainerAppointments(this.userId);
    this.appointments = response;
    console.log('Trainer appointments:', response);
    
  }
  private setInitialTab() {
    if (this.userRole === 'Trainer') {
      this.activeTab = 'create-class';
    } else if (this.userRole === 'Member') {
      this.activeTab = 'book-trainer';
    } else if (this.userRole === 'Admin') {
      this.activeTab = 'pending-payments';
    }
    console.log('User role:', this.userRole, 'Active tab:', this.activeTab);
  }

  private updateFormsWithUserId() {
    if (this.userId && this.userRole) {
      if (this.userRole === 'Member') {
        this.bookTrainerForm.patchValue({ memberId: this.userId });
        this.bookClassForm.patchValue({ memberId: this.userId });
      }
      if (this.userRole === 'Trainer') {
        this.createClassForm.patchValue({ trainerId: this.userId });
      }
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Scheduled': return 'bg-primary';
      case 'In Progress': return 'bg-warning text-dark';
      case 'Completed': return 'bg-success';
      case 'Cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getPaymentClass(paymentStatus: string): string {
    switch (paymentStatus) {
      case 'Completed': return 'bg-success';
      case 'Pending': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }

  public async getProfile() {
    try {
      const response = await this.authService.getloggedInUserAsync();
      this.userData = response;
      this.userId = this.userData.id;
      this.userRole = this.userData.role;
      console.log('User profile loaded:', this.userData);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }

  
  private createBookTrainerForm(): FormGroup {
    return this.fb.group({
      memberId: ['', [Validators.required]],
      trainerId: ['', [Validators.required]],
      appointmentDate: ['', [Validators.required]],
      appointmentTime: ['', [Validators.required]],
      duration: [60, [Validators.required, Validators.min(30)]]
    });
  }

  private createBookClassForm(): FormGroup {
    return this.fb.group({
      memberId: ['', [Validators.required]],
      classId: ['', [Validators.required]]
    });
  }

  private createClassFormForm(): FormGroup {
    return this.fb.group({
      className: ['', [Validators.required]],
      trainerId: ['', [Validators.required]],
      scheduleDate: ['', [Validators.required]],
      scheduleTime: ['', [Validators.required]],
      duration: [60, [Validators.required, Validators.min(30)]],
      maxCapacity: [20, [Validators.required, Validators.min(1)]]
    });
  }

  // INITIAL DATA LOADING
  private loadInitialData() {
    this.loadUpcomingClasses();
    this.loadAllFitnessClasses();
    this.loadAllTrainers();

    if (this.userRole === 'Member') {
      this.loadMemberAppointments();
    }
  }

  
  private setupFormListeners(): void {
    this.bookTrainerForm.get('appointmentDate')?.valueChanges.subscribe(() => {
      this.onDateTimeChange();
    });

    this.bookTrainerForm.get('appointmentTime')?.valueChanges.subscribe(() => {
      this.onDateTimeChange();
    });
  }

  
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.clearMessages();

    if (tab === 'my-appointments' && this.userRole === 'Member') {
      this.loadMemberAppointments();
    }
    if (tab === 'pending-payments' && this.userRole === 'Admin') {
      this.loadPendingPayments();
    }
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  async onBookTrainer() {
    if (this.bookTrainerForm.invalid) {
      this.markFormGroupTouched(this.bookTrainerForm);
      this.errorMessage = 'Please fill all required fields correctly';
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    try {
      const formValue = this.bookTrainerForm.value;

      const payload = {
        memberId: Number(this.userId),
        trainerId: Number(formValue.trainerId),
        appointmentDate: this.formatDateForBackend(formValue.appointmentDate),
        appointmentTime: this.formatTimeForBackend(formValue.appointmentTime),
        duration: Number(formValue.duration)
      };

      console.log('Booking trainer with payload:', payload);

      const result: any = await this.appointmentService.bookTrainer(payload);
      this.successMessage = result.message || 'Trainer booked successfully!';
      this.bookTrainerForm.reset({ duration: 60 });
      this.updateFormsWithUserId();

      
      if (result.appointmentId) {
        await this.showPaymentOptions(result.appointmentId, 'trainer');
      }

      await this.loadMemberAppointments();
    } catch (error: any) {
      console.error('Booking error:', error);
      this.errorMessage = error.error?.message || 'Failed to book trainer';
    } finally {
      this.isLoading = false;
    }
  }

  async onBookClass() {
    console.log('=== BOOK CLASS CLICKED ===');
    console.log('Form valid:', this.bookClassForm.valid);
    console.log('Selected class:', this.selectedClass);

    if (this.bookClassForm.invalid || !this.selectedClass) {
      this.errorMessage = 'Please select a class first';
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    try {
      const payload = {
        memberId: Number(this.userId),
        classId: Number(this.selectedClass.id),
        appointmentDate: this.formatDateForBackend(this.selectedClass.scheduleDate),
        appointmentTime: this.formatTimeForBackend(this.selectedClass.scheduleTime),
        duration: Number(this.selectedClass.duration)
      };

      console.log('Sending class booking payload:', payload);

      const result: any = await this.appointmentService.bookClass(payload);
      this.successMessage = result.message || 'Class booked successfully!';
      this.bookClassForm.reset();
      this.selectedClass = null;

      
      if (result.appointmentId) {
        await this.showPaymentOptions(result.appointmentId, 'class');
      }

      await this.loadUpcomingClasses();
      await this.loadMemberAppointments();
    } catch (error: any) {
      console.error('Booking error:', error);
      this.errorMessage = error.error?.message || 'Failed to book class';
    } finally {
      this.isLoading = false;
    }
  }

  async onCreateClass() {
    if (this.createClassForm.invalid) {
      this.markFormGroupTouched(this.createClassForm);
      this.errorMessage = 'Please fill all required fields correctly';
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    try {
      const formValue = this.createClassForm.value;

      const payload = {
        className: formValue.className,
        trainerId: Number(this.userId),
        scheduleDate: this.formatDateForBackend(formValue.scheduleDate),
        scheduleTime: this.formatTimeForBackend(formValue.scheduleTime),
        duration: Number(formValue.duration),
        maxCapacity: Number(formValue.maxCapacity)
      };

      console.log('Creating class with payload:', payload);

      const result: any = await this.appointmentService.createFitnessClass(payload);
      this.successMessage = result.message || 'Class created successfully!';
      this.createClassForm.reset({ duration: 60, maxCapacity: 20 });
      this.updateFormsWithUserId();
      this.loadAllFitnessClasses();
    } catch (error: any) {
      this.errorMessage = error.error?.message || 'Failed to create class';
    } finally {
      this.isLoading = false;
    }
  }

  async onCancelAppointment(appointmentId: number) {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await this.appointmentService.cancelAppointment(appointmentId);
      this.successMessage = 'Appointment cancelled successfully!';
      this.loadMemberAppointments();
    } catch (error: any) {
      this.errorMessage = error.error?.message || 'Failed to cancel appointment';
    }
  }

  
  private async loadUpcomingClasses() {
    try {
      this.upcomingClasses = await this.appointmentService.getUpcomingClasses();
      console.log('Upcoming classes loaded:', this.upcomingClasses);
    } catch (error) {
      console.error('Failed to load upcoming classes:', error);
    }
  }

  private async loadAllFitnessClasses() {
    try {
      this.allFitnessClasses = await this.appointmentService.getAllFitnessClasses();
    } catch (error) {
      console.error('Failed to load fitness classes:', error);
    }
  }

  private async loadAllTrainers() {
    try {
      this.allTrainers = await this.trainerService.getTrainersAsync();
    } catch (error) {
      console.error('Failed to load trainers:', error);
    }
  }

  async loadAvailableTrainers() {
    const date = this.bookTrainerForm.get('appointmentDate')?.value;
    const time = this.bookTrainerForm.get('appointmentTime')?.value;

    if (!date || !time) {
      this.errorMessage = 'Please select both date and time first';
      return;
    }

    try {
      const formattedDate = this.formatDateForBackend(date);
      const formattedTime = this.formatTimeForBackend(time);

      this.availableTrainers = await this.appointmentService.getAvailableTrainers(formattedDate, formattedTime);
    } catch (error) {
      console.error('Failed to load available trainers:', error);
      this.errorMessage = 'Failed to load available trainers';
    }
  }

  async loadMemberAppointments() {
    if (!this.userId || this.userRole !== 'Member') {
      return;
    }

    try {
      this.memberAppointments = await this.appointmentService.getMemberAppointments(this.userId);
    } catch (error: any) {
      console.error('Failed to load appointments:', error);
      this.errorMessage = error.error?.message || 'Failed to load appointments';
    }
  }

  
  private onDateTimeChange(): void {
    if (this.bookTrainerForm.get('appointmentDate')?.value &&
      this.bookTrainerForm.get('appointmentTime')?.value) {
      this.loadAvailableTrainers();
    }
  }

  
  onClassSelected(event: any) {
    const classId = event.target.value;
    this.selectedClass = this.upcomingClasses.find((c: any) => c.id == classId);
    this.bookClassForm.patchValue({ classId: classId, memberId: this.userId });

    console.log('Selected class:', this.selectedClass);
  }

  
  private formatDateForBackend(dateString: string): string {
    if (!dateString) return '';

    try {
      // If it's already in YYYY-MM-DD format, return as is
      if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      }

      
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  private formatTimeForBackend(timeString: string): string {
    if (!timeString) return '';

    try {
      // If it's already in HH:MM format, return as is
      if (typeof timeString === 'string' && timeString.match(/^\d{2}:\d{2}$/)) {
        return timeString;
      }

      
      if (timeString.includes(':')) {
        const [hours, minutes] = timeString.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
      }

      return timeString;
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  }

  // VALIDATION HELPERS
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field?.errors?.['required']) return 'This field is required';
    if (field?.errors?.['min']) return `Minimum value is ${field.errors?.['min'].min}`;
    return '';
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'scheduled': return 'badge bg-primary';
      case 'completed': return 'badge bg-success';
      case 'cancelled': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  
  onPaymentMethodChange(method: string) {
    this.selectedPaymentMethod = method;
  }

  
  async processPayment() {
    if (!this.selectedPaymentMethod || !this.selectedAppointmentForPayment) {
      this.errorMessage = 'Please select a payment method';
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    try {
      if (this.selectedPaymentMethod === 'Card') {
        
        if (this.selectedAppointmentForPayment.type === 'trainer') {
          const sessionResult = await this.appointmentService.createTrainerPaymentSession(
            this.userId,
            this.selectedAppointmentForPayment.id
          );

          
          await this.redirectToStripe(sessionResult.sessionId);
        } else {
          const sessionResult = await this.appointmentService.createClassPaymentSession(
            this.userId,
            this.selectedAppointmentForPayment.id
          );

          await this.redirectToStripe(sessionResult.sessionId);
        }
      } else {
        
        const result = await this.appointmentService.processAppointmentPayment({
          memberId: this.userId,
          appointmentId: this.selectedAppointmentForPayment.id,
          paymentMethod: this.selectedPaymentMethod
        });

        this.successMessage = result.message;
        this.closePaymentModal();
        await this.loadMemberAppointments();
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      this.errorMessage = error.error?.message || 'Payment failed';
    } finally {
      this.isLoading = false;
    }
  }

  
  private async redirectToStripe(sessionId: string) {
    const stripe = await loadStripe('pk_test_51SU39kK7gKal9maapfl9r23q6Y5XnUO6lkgglPEMfRRDmTYu4PTHfSmdMqHqIP75iogWeX2qm5TCmEQxm34iQcrt00PDrMzH7c');

    if (!stripe) {
      this.errorMessage = 'Failed to initialize payment system';
      return;
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      this.errorMessage = error.message || 'Payment redirect failed';
    }
  }

  
  closePaymentModal() {
    this.showPaymentModal = false;
    this.selectedPaymentMethod = '';
    this.selectedAppointmentForPayment = null;
  }

  // Handle payment confirmation after redirect
  public async handlePaymentRedirect() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
      try {
        const result = await this.appointmentService.confirmAppointmentPayment(sessionId);
        this.successMessage = result.message;
        await this.loadMemberAppointments();
      } catch (error: any) {
        this.errorMessage = 'Payment confirmation failed';
      }
    }
  }


  async loadPendingPayments() {
    if (this.userRole !== 'Admin') return;

    try {
      const resp:any = await this.appointmentService.getPendingPayments();
      this.pendingPayments = resp;
      console.log('Pending payments loaded:', this.pendingPayments);
    } catch (error: any) {
      console.error('Failed to load pending payments:', error);
      this.errorMessage = error.error?.message || 'Failed to load pending payments';
    }
  }

  
  async approvePayment(paymentId: number) {
    if (!confirm('Are you sure you want to approve this payment?')) return;

    try {
      await this.appointmentService.updatePaymentStatus({
        paymentId: paymentId,
        newStatus: 'Completed'
      });

      this.successMessage = 'Payment approved successfully!';
      await this.loadPendingPayments();
    } catch (error: any) {
      console.error('Failed to approve payment:', error);
      this.errorMessage = error.error?.message || 'Failed to approve payment';
    }
  }

  
  async rejectPayment(paymentId: number) {
    if (!confirm('Are you sure you want to reject this payment?')) return;

    try {
      await this.appointmentService.updatePaymentStatus({
        paymentId: paymentId,
        newStatus: 'Cancelled'
      });

      this.successMessage = 'Payment rejected successfully!';
      await this.loadPendingPayments();
    } catch (error: any) {
      console.error('Failed to reject payment:', error);
      this.errorMessage = error.error?.message || 'Failed to reject payment';
    }
  }

  
  getPaymentStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending': return 'badge bg-warning';
      case 'completed': return 'badge bg-success';
      case 'cancelled': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }


  
getAppointmentPrice(): number {
  if (!this.selectedAppointmentForPayment) return 0;
  
  if (this.selectedAppointmentForPayment.type === 'trainer') {
      
      const formValue = this.bookTrainerForm.value;
      const duration = formValue.duration || 60;
      
      const baseRate = 50; 
      const additionalRate = 10; 
      
      const hours = Math.floor(duration / 60);
      const additionalHalfHours = Math.ceil((duration % 60) / 30);
      
      return (hours * baseRate) + (additionalHalfHours * additionalRate);
  } else {
      
      return 25;
  }
}


private async showPaymentOptions(appointmentId: number, type: 'trainer' | 'class') {
  const price = this.getAppointmentPrice();
  this.selectedAppointmentForPayment = { 
      id: appointmentId, 
      type: type,
      price: price
  };
  this.showPaymentModal = true;
}

}