import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../services/appointments/appointment-service';
import { TrainerService } from '../trainer/trainer-service';
import { Auth } from '../../auth/services/auth';

@Component({
  selector: 'app-appointments',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointments.html',
  styleUrl: './appointments.scss'
})
export class Appointments implements OnInit {
  // Forms
  bookTrainerForm: FormGroup;
  bookClassForm: FormGroup;
  createClassForm: FormGroup;

  // Data arrays
  upcomingClasses: any = [];
  availableTrainers: any = [];
  memberAppointments: any = [];
  allFitnessClasses: any = [];
  allTrainers: any = [];
  public userData: any = [];
  selectedClass: any = null;

  // UI states
  public activeTab: string = 'book-trainer';
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  public userId: number;
  public userRole: string;

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
    this.setInitialTab();
    this.updateFormsWithUserId();
    this.loadInitialData();
    this.setupFormListeners();
  }

  private setInitialTab() {
    if (this.userRole === 'Trainer') {
      this.activeTab = 'create-class';
    } else if (this.userRole === 'Member') {
      this.activeTab = 'book-trainer';
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

  // FORM CREATION
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

  // FORM LISTENERS
  private setupFormListeners(): void {
    this.bookTrainerForm.get('appointmentDate')?.valueChanges.subscribe(() => {
      this.onDateTimeChange();
    });

    this.bookTrainerForm.get('appointmentTime')?.valueChanges.subscribe(() => {
      this.onDateTimeChange();
    });
  }

  // UI MANAGEMENT
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.clearMessages();

    if (tab === 'my-appointments' && this.userRole === 'Member') {
      this.loadMemberAppointments();
    }
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  // MAIN ACTIONS
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

  // DATA LOADING
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

  // EVENT HANDLERS
  private onDateTimeChange(): void {
    if (this.bookTrainerForm.get('appointmentDate')?.value &&
      this.bookTrainerForm.get('appointmentTime')?.value) {
      this.loadAvailableTrainers();
    }
  }

  // CLASS SELECTION HANDLER
  onClassSelected(event: any) {
    const classId = event.target.value;
    this.selectedClass = this.upcomingClasses.find((c: any) => c.id == classId);
    this.bookClassForm.patchValue({ classId: classId, memberId: this.userId });

    console.log('Selected class:', this.selectedClass);
  }

  // FORMATTING HELPERS
  private formatDateForBackend(dateString: string): string {
    if (!dateString) return '';
    
    try {
      // If it's already in YYYY-MM-DD format, return as is
      if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      }
      
      // Convert to YYYY-MM-DD format for DateOnly
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
      
      // Convert to HH:MM format for TimeOnly
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
}