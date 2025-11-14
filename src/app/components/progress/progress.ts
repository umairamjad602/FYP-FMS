import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProgressService } from '../../services/progress/progress-service';

@Component({
  selector: 'app-progress',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './progress.html',
  styleUrl: './progress.scss'
})
export class Progress implements OnInit {

  fitnessForm!: FormGroup;
  exerciseTypes: string[] = ['Running', 'Weight Training', 'Yoga', 'Cycling', 'Swimming', 'Walking', 'Cardio', 'Other'];
  public historyLists: any = [];

  constructor(private fb: FormBuilder,
    private progressService: ProgressService
  ) { }

  ngOnInit(): void {
    this.inItForm();
    this.getProgressHistory();
  }

  inItForm(): void {
    this.fitnessForm = this.fb.group({
      entryDate: [new Date().toISOString().split('T')[0], Validators.required],
      weight: [''],
      workoutDuration: [''],
      caloriesBurned: [''],
      exerciseType: ['', Validators.required],
      notes: ['']
    });
  }
  async getProgressHistory() {
    this.historyLists = await this.progressService.getProgressHistory();
  }

  async onSubmit() {
    try{
      const payload = this.fitnessForm.value;
      await this.progressService.createProgress(payload);
      this.getProgressHistory();
      alert('Progress saved successfully!');
      this.fitnessForm.reset({
        entryDate: new Date().toISOString().split('T')[0],
        exerciseType: ''
      });
    }
    catch(error:any){
      alert('Error saving progress. Please try again.');
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  displayWeight(weight: number | null): string {
    return weight ? weight + ' kg' : '-';
  }

  displayDuration(duration: number | null): string {
    return duration ? duration + ' min' : '-';
  }
}