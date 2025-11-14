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
  selectedClass: any = null; // Add this property

  // UI states
  activeTab: string = 'book-trainer';
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  public userId: number;

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
    this.updateBookTrainerFormWithUserId();
    this.loadInitialData();
    this.setupFormListeners();
  }

  private updateBookTrainerFormWithUserId() {
    if (this.userId) {
      this.bookTrainerForm.patchValue({ memberId: this.userId });
      console.log('Book Trainer form updated with user ID:', this.userId);
    }
  }

  public async getProfile(){
    const response = await this.authService.getloggedInUserAsync();
    console.log(response, 'rip');
    this.userData = response;
    this.userId = this.userData.id;
    console.log(this.userId, 'rip id');
  }

  // FORM CREATION
  private createBookTrainerForm(): FormGroup {
    console.log('tttttt', this.userId);
    
    return this.fb.group({
      memberId: [''],
      trainerId: ['', [Validators.required]],
      appointmentDate: ['', [Validators.required]],
      appointmentTime: ['', [Validators.required]],
      duration: [60, [Validators.required, Validators.min(30)]]
    });
  }

  private createBookClassForm(): FormGroup {
    return this.fb.group({
      memberId: [this.userId],
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
  }

  // FORM LISTENERS
  private setupFormListeners(): void {
    this.bookTrainerForm.get('appointmentDate')?.valueChanges.subscribe(() => {
      this.onDateTimeChange();
    });

    this.bookTrainerForm.get('appointmentTime')?.valueChanges.subscribe(() => {
      this.onDateTimeChange();
    });

    this.bookTrainerForm.get('memberId')?.valueChanges.subscribe((value) => {
      this.bookClassForm.patchValue({ memberId: value }, { emitEvent: false });
    });

    this.bookClassForm.get('memberId')?.valueChanges.subscribe((value) => {
      this.bookTrainerForm.patchValue({ memberId: value }, { emitEvent: false });
    });
  }

  // UI MANAGEMENT
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.clearMessages();

    if (tab === 'my-appointments') {
      this.loadMemberAppointments();
    }
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  // MAIN ACTIONS
  async onBookTrainer() {
    if (this.bookTrainerForm.invalid) return;

    this.isLoading = true;
    try {
      const result: any = await this.appointmentService.bookTrainer(this.bookTrainerForm.value);
      this.successMessage = result.message || 'Trainer booked successfully!';
      this.bookTrainerForm.reset();
    } catch (error: any) {
      this.errorMessage = error.error?.message || 'Failed to book trainer';
    } finally {
      this.isLoading = false;
    }
  }

  async onBookClass() {
    console.log('=== BOOK CLASS CLICKED ===');
    console.log('Form valid:', this.bookClassForm.valid);
    console.log('Form values:', this.bookClassForm.value);

    if (this.bookClassForm.invalid) {
      console.log('FORM IS INVALID - cannot submit');
      this.errorMessage = 'Please fill all required fields correctly';
      return;
    }

    if (!this.selectedClass) {
      this.errorMessage = 'Please select a class first';
      return;
    }

    console.log('Form is valid, proceeding with API call...');
    this.isLoading = true;

    try {
      // Build payload with class details
      const payload = {
        memberId: Number(this.userId), // Convert to number
        trainerId: Number(this.bookTrainerForm.value.trainerId), // Convert to number
        appointmentDate: this.bookTrainerForm.value.appointmentDate,
        appointmentTime: this.bookTrainerForm.value.appointmentTime,
        duration: Number(this.bookTrainerForm.value.duration) // Convert to number
      };
      
      console.log('Sending payload to API:', payload);

      const result: any = await this.appointmentService.bookClass(payload);
      console.log('API response:', result);

      this.successMessage = result.message || 'Class booked successfully!';
      this.bookClassForm.reset();
      this.selectedClass = null;
      await this.loadUpcomingClasses();
    } catch (error: any) {
      console.error('Booking error:', error);
      this.errorMessage = error.error?.message || 'Failed to book class';
    } finally {
      this.isLoading = false;
    }
  }

  async onCreateClass() {
    if (this.createClassForm.invalid) return;

    this.isLoading = true;
    try {
      const result: any = await this.appointmentService.createFitnessClass(this.createClassForm.value);
      this.successMessage = result.message || 'Class created successfully!';
      this.createClassForm.reset();
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
      this.errorMessage = error.error?.message;
    }
  }

  // DATA LOADING
  private async loadUpcomingClasses() {
    try {
      this.upcomingClasses = await this.appointmentService.getUpcomingClasses();
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

    if (!date || !time) return;

    try {
      this.availableTrainers = await this.appointmentService.getAvailableTrainers(date, time);
    } catch (error) {
      console.error('Failed to load available trainers:', error);
    }
  }

  async loadMemberAppointments() {
    const memberId = this.userId;
    if (!memberId) {
      this.errorMessage = 'Please enter Member ID first';
      return;
    }

    try {
      this.memberAppointments = await this.appointmentService.getMemberAppointments(memberId);
    } catch (error: any) {
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
    
    console.log('Selected class:', this.selectedClass);
  }

  // HELPER FUNCTIONS
  setMemberId() {
    this.bookTrainerForm.patchValue({memberId: this.userId});
    this.bookClassForm.patchValue({memberId: this.userId});
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

  // DATE FORMATTING HELPER
  private formatDate(dateString: string): string {
    if (!dateString) return '';
    
    // If it's already in YYYY-MM-DD format, return as is
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    
    // If it's a Date object or ISO string, convert to YYYY-MM-DD
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }
}