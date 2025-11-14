import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MemberService } from '../member-service';
import { Auth } from '../../../auth/services/auth';
import { TrainerService } from '../../trainer/trainer-service';

@Component({
  selector: 'app-reviews',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './reviews.html',
  styleUrl: './reviews.scss'
})
export class Reviews {
  public membersList: any[] = [];
  public trainerId: any;
  public trainerList: any[] = [];
  public assignedTrainer: any;

  public memberForm: FormGroup;
  public selectedTrainer: any = null;
  public memberId: number;
  
  // Review management properties
  public myReviews: any[] = [];
  public isEditing: boolean = false;
  public editingReviewId: number = 0;

  constructor(
    private fb: FormBuilder,
    private memberService: MemberService,
    private authService: Auth,
    private trainerService: TrainerService
  ){}

  async ngOnInit(){
    this.inItForm();
    await this.getloggedInUserAsync();
    await this.getAssignedTrainer();
    await this.loadMyReviews();
  }

  public async getloggedInUserAsync(){
    const response:any = await this.authService.getloggedInUserAsync();
    this.memberId = response.id;
    this.trainerId = response.trainerId;
  }

  public async getAssignedTrainer(){
    const response:any = await this.trainerService.getTrainersAsync();
    this.trainerList = response;
    this.assignedTrainer = this.trainerList.find(t => t.id == this.trainerId);
  }

  public async loadMyReviews() {
    if (this.memberId) {
      const response: any = await this.memberService.getReviewsByMember(this.memberId);
      this.myReviews = response;
    }
  }

  selectTrainer(trainer: any): void {
    this.selectedTrainer = trainer;
    this.memberForm.patchValue({
      trainerId: trainer.id,
      memberId: this.memberId
    });
    this.isEditing = false;
    this.editingReviewId = 0;
  }

  setRating(stars: number): void {
    this.memberForm.patchValue({
      rating: stars
    });
  }

  async submitReview(): Promise<void> {
    if (this.memberForm.valid) {
      const payload = this.memberForm.value;
      
      try {
        if (this.isEditing) {
          await this.memberService.updateReview(this.editingReviewId, payload);
        } else {
          await this.memberService.createReview(payload);
        }
        
        await this.loadMyReviews(); // Refresh reviews list
        this.resetForm();
        alert(this.isEditing ? 'Review updated successfully!' : 'Review submitted successfully!');
      } catch (error) {
        console.error('Error submitting review:', error);
        alert('Error submitting review. Please try again.');
      }
    }
  }

  editReview(review: any): void {
    this.isEditing = true;
    this.editingReviewId = review.id;
    
    const trainer = this.trainerList.find(t => t.id === review.trainerId);
    this.selectedTrainer = trainer;
    
    this.memberForm.patchValue({
      trainerId: review.trainerId,
      memberId: review.memberId,
      rating: review.rating,
      comment: review.comment
    });
  }

  async deleteReview(reviewId: number): Promise<void> {
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        await this.memberService.deleteReview(reviewId);
        await this.loadMyReviews(); // Refresh reviews list
        
        if (this.isEditing && this.editingReviewId === reviewId) {
          this.resetForm();
        }
        alert('Review deleted successfully!');
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('Error deleting review. Please try again.');
      }
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  public inItForm() {
    this.memberForm = this.fb.group({
      trainerId: ['', [Validators.required]],
      memberId: [this.memberId, [Validators.required]],
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: [''],
    })
  }

  private resetForm(): void {
    this.selectedTrainer = null;
    this.isEditing = false;
    this.editingReviewId = 0;
    this.memberForm.patchValue({
      trainerId: '',
      rating: 0,
      comment: ''
    });
  }

  get currentRating(): number {
    return this.memberForm.get('rating')?.value || 0;
  }

  getTrainerName(trainerId: number): string {
    const trainer = this.trainerList.find(t => t.id === trainerId);
    return trainer?.fullName || 'Unknown Trainer';
  }

  getStars(rating: number): number[] {
    return Array.from({ length: rating }, (_, i) => i + 1);
  }

  getEmptyStars(rating: number): number[] {
    return Array.from({ length: 5 - rating }, (_, i) => i + 1);
  }
}