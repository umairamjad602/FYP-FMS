import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WorkoutPlanService } from '../../services/workout/workout-plan-service';
import { MemberService } from '../member/member-service';
import { Auth } from '../../auth/services/auth';
import { ToastrService } from 'ngx-toastr';

interface WorkoutPlan {
  id?: number;
  title: string;
  description: string;
  duration: number;
  difficulty: string;
  exercises: Exercise[];
  assignedTo: number[];
  createdDate?: string;
  trainerId?: number;
}

interface Exercise {
  id?: number;
  name: string;
  sets: number;
  reps: number;
  restTime: number;
  instructions: string;
  workoutPlanId?: number;
}

interface Member {
  id: number;
  name: string;
  email: string;
  fullName?: string;
  userName?: string;
  trainerId?: number;
}

interface UserProfile {
  id: number;
  role: string;
  name: string;
  email: string;
  
}

@Component({
  selector: 'app-workout-plans',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './workout-plans.html',
  styleUrl: './workout-plans.scss'
})
export class WorkoutPlans implements OnInit {
  
  workoutForm: FormGroup;
  exerciseForm: FormGroup;
  assignForm: FormGroup;
  
  workoutPlans: WorkoutPlan[] = [];
  assignedMembers: any[] = [];
  trainerMembers: Member[] = []; 
  myAssignedWorkout: any = [];
  
  isEditing: boolean = false;
  editingWorkoutId: number = 0;
  showExerciseForm: boolean = false;
  currentExercises: Exercise[] = [];
  showAssignModal: boolean = false;
  selectedWorkoutForAssign: WorkoutPlan | null = null;

  
  userRole: string = 'Trainer';
  userId: number = 0;
  userProfile: UserProfile | null = null; 
  difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  
  constructor(
    private fb: FormBuilder,
    private workoutPlanService: WorkoutPlanService,
    private memberService: MemberService,
    private authService: Auth, 
    private toastr: ToastrService
  ) {
    this.workoutForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      duration: [30, [Validators.required, Validators.min(1), Validators.max(120)]],
      difficulty: ['Intermediate', [Validators.required]]
    });

    this.exerciseForm = this.fb.group({
      name: ['', [Validators.required]],
      sets: [3, [Validators.required, Validators.min(1)]],
      reps: [10, [Validators.required, Validators.min(1)]],
      restTime: [60, [Validators.required, Validators.min(10)]],
      instructions: ['']
    });

    this.assignForm = this.fb.group({
      memberIds: [[], [Validators.required]]
    });
  }

  async ngOnInit() {
    await this.getUserRole();
    
    if (this.isTrainer()) {
      await this.loadTrainerMembers();
      await this.loadWorkoutPlans();
      this.updateAssignedMembers();
    } else if (this.isMember()) {
      await this.loadMyAssignedWorkout();
    }
  }

  async getUserRole() {
    try {
      const user: any = await this.authService.getloggedInUserAsync();
      this.userProfile = user;
      this.userRole = user.role;
      this.userId = user.id;
      console.log('User profile loaded:', this.userProfile);
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Fallback to localStorage if needed
      this.userRole = localStorage.getItem('role') || 'Member';
      this.userId = parseInt(localStorage.getItem('userId') || '0');
      this.toastr.warning('Using cached user data');
    }
  }

  isTrainer(): boolean {
    return this.userRole === 'Trainer';
  }

  isMember(): boolean {
    return this.userRole === 'Member';
  }

  async loadTrainerMembers() {
    try {
      const response: any = await this.workoutPlanService.getMembersByTrainer(this.userId);
      this.trainerMembers = response;
      console.log('Trainer members loaded:', this.trainerMembers);
    } catch (error) {
      console.error('Error loading trainer members:', error);
      this.toastr.error('Failed to load your members');
    }
  }

  async loadWorkoutPlans() {
    try {
      const response: any = await this.workoutPlanService.getWorkoutPlansByTrainer(this.userId);
      this.workoutPlans = response;
      this.toastr.success('Workout plans loaded successfully!');
    } catch (error) {
      console.error('Error loading workout plans:', error);
      this.toastr.error('Failed to load workout plans');
    }
  }

  async loadMyAssignedWorkout() {
    try {
      const response: any = await this.workoutPlanService.getWorkoutPlansByMember(this.userId);
      this.myAssignedWorkout = response || []; 
      
      console.log('Loaded assigned workouts:', this.myAssignedWorkout);
      
      if (this.myAssignedWorkout.length > 0) {
        this.toastr.success(`Loaded ${this.myAssignedWorkout.length} workout plan(s) successfully!`);
      } else {
        this.toastr.info('No workout plans assigned yet. Please contact your trainer.');
      }
    } catch (error) {
      console.error('Error loading assigned workouts:', error);
      this.toastr.error('Failed to load your workout plans');
    }
  }

  updateAssignedMembers() {
    
    const assignedMemberIds = new Set<number>();
    
    this.workoutPlans.forEach(workout => {
      if (workout.assignedTo) {
        workout.assignedTo.forEach(memberId => assignedMemberIds.add(memberId));
      }
    });

    this.assignedMembers = this.trainerMembers.filter(member => 
      assignedMemberIds.has(member.id)
    );
  }

  
  getAssignedWorkoutForMember(memberId: number): WorkoutPlan | null {
    for (const workout of this.workoutPlans) {
      if (workout.assignedTo && workout.assignedTo.includes(memberId)) {
        return workout;
      }
    }
    return null;
  }

  
  
getAssignedWorkoutsForMember(memberId: number): WorkoutPlan[] {
  return this.workoutPlans.filter(workout => 
    workout.assignedTo && workout.assignedTo.includes(memberId)
  );
}


getAssignedWorkoutNames(member: Member): string {
  const assignedWorkouts = this.getAssignedWorkoutsForMember(member.id);
  
  if (assignedWorkouts.length === 0) {
    return 'Not assigned';
  } else if (assignedWorkouts.length === 1) {
    return assignedWorkouts[0].title;
  } else {
    return `${assignedWorkouts.length} workouts assigned`;
  }
}


getAssignedWorkoutsDetail(member: Member): string {
  const assignedWorkouts = this.getAssignedWorkoutsForMember(member.id);
  
  if (assignedWorkouts.length === 0) {
    return 'No workouts assigned';
  }
  
  return assignedWorkouts.map(workout => workout.title).join(', ');
}

  async createWorkoutPlan() {
    if (this.workoutForm.valid && this.currentExercises.length > 0) {
      try {
        const payload = {
          title: this.workoutForm.value.title,
          description: this.workoutForm.value.description,
          duration: this.workoutForm.value.duration,
          difficulty: this.workoutForm.value.difficulty,
          trainerId: this.userId,
          exercises: this.currentExercises.map(exercise => ({
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            restTime: exercise.restTime,
            instructions: exercise.instructions
          }))
        };

        const response: any = await this.workoutPlanService.createWorkoutPlan(payload);
        this.workoutPlans.unshift(response);
        this.resetForms();
        this.toastr.success('Workout plan created successfully!');
      } catch (error: any) {
        console.error('Error creating workout plan:', error);
        if (error.error && error.error.errors) {
          this.toastr.error('Validation error: Please check all fields');
        } else {
          this.toastr.error('Failed to create workout plan');
        }
      }
    } else {
      this.toastr.warning('Please fill all required fields and add at least one exercise');
    }
  }

  async updateWorkoutPlan() {
    if (this.workoutForm.valid && this.currentExercises.length > 0) {
      try {
        const payload = {
          title: this.workoutForm.value.title,
          description: this.workoutForm.value.description,
          duration: this.workoutForm.value.duration,
          difficulty: this.workoutForm.value.difficulty,
          exercises: this.currentExercises.map(exercise => ({
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            restTime: exercise.restTime,
            instructions: exercise.instructions
          }))
        };

        await this.workoutPlanService.updateWorkoutPlan(this.editingWorkoutId, payload);
        
        const index = this.workoutPlans.findIndex(wp => wp.id === this.editingWorkoutId);
        if (index !== -1) {
          this.workoutPlans[index] = { 
            ...this.workoutPlans[index], 
            ...payload,
            id: this.editingWorkoutId 
          };
        }
        
        this.resetForms();
        this.toastr.success('Workout plan updated successfully!');
      } catch (error: any) {
        console.error('Error updating workout plan:', error);
        if (error.error && error.error.errors) {
          this.toastr.error('Validation error: Please check all fields');
        } else {
          this.toastr.error('Failed to update workout plan');
        }
      }
    }
  }

  async submitWorkout() {
    if (this.isEditing) {
      await this.updateWorkoutPlan();
    } else {
      await this.createWorkoutPlan();
    }
  }

  editWorkoutPlan(workout: WorkoutPlan) {
    this.isEditing = true;
    this.editingWorkoutId = workout.id!;
    this.currentExercises = workout.exercises.map(exercise => ({
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      restTime: exercise.restTime,
      instructions: exercise.instructions || ''
    }));
    
    this.workoutForm.patchValue({
      title: workout.title,
      description: workout.description,
      duration: workout.duration,
      difficulty: workout.difficulty
    });
  }

  async deleteWorkoutPlan(workoutId: number) {
    if (confirm('Are you sure you want to delete this workout plan?')) {
      try {
        await this.workoutPlanService.deleteWorkoutPlan(workoutId);
        this.workoutPlans = this.workoutPlans.filter(wp => wp.id !== workoutId);
        this.updateAssignedMembers();
        this.toastr.success('Workout plan deleted successfully!');
      } catch (error) {
        console.error('Error deleting workout plan:', error);
        this.toastr.error('Failed to delete workout plan');
      }
    }
  }

  addExercise() {
    if (this.exerciseForm.valid) {
      this.currentExercises.push({
        name: this.exerciseForm.value.name,
        sets: this.exerciseForm.value.sets,
        reps: this.exerciseForm.value.reps,
        restTime: this.exerciseForm.value.restTime,
        instructions: this.exerciseForm.value.instructions
      });
      this.exerciseForm.reset({
        sets: 3,
        reps: 10,
        restTime: 60,
        instructions: ''
      });
      this.showExerciseForm = false;
      this.toastr.info('Exercise added successfully!');
    } else {
      this.toastr.warning('Please fill all exercise fields');
    }
  }

  removeExercise(index: number) {
    const exerciseName = this.currentExercises[index].name;
    this.currentExercises.splice(index, 1);
    this.toastr.info(`Exercise "${exerciseName}" removed`);
  }

  openAssignModal(workout: WorkoutPlan) {
    this.selectedWorkoutForAssign = workout;
    this.assignForm.patchValue({
      memberIds: workout.assignedTo || []
    });
    this.showAssignModal = true;
  }

  async assignWorkoutToMembers() {
    if (this.assignForm.valid && this.selectedWorkoutForAssign) {
      try {
        const memberIds = this.assignForm.value.memberIds;
        let successCount = 0;
        let errorCount = 0;

        
        for (const memberId of memberIds) {
          try {
            const payload = {
              workoutPlanId: this.selectedWorkoutForAssign!.id,
              memberId: memberId
            };
            await this.workoutPlanService.assignWorkoutToMember(payload);
            successCount++;
          } catch (error) {
            console.error(`Error assigning to member ${memberId}:`, error);
            errorCount++;
          }
        }

        
        if (this.selectedWorkoutForAssign) {
          const currentAssigned = this.selectedWorkoutForAssign.assignedTo || [];
          const newAssignments = memberIds.filter((id: number) => !currentAssigned.includes(id));
          this.selectedWorkoutForAssign.assignedTo = [...currentAssigned, ...newAssignments];
        }
        
        this.updateAssignedMembers();
        this.closeAssignModal();
        
        if (errorCount === 0) {
          this.toastr.success(`Workout assigned to ${successCount} member(s) successfully!`);
        } else {
          this.toastr.warning(`Assigned to ${successCount} members, ${errorCount} failed`);
        }
      } catch (error) {
        console.error('Error assigning workout:', error);
        this.toastr.error('Failed to assign workout to members');
      }
    } else {
      this.toastr.warning('Please select at least one member to assign');
    }
  }

  closeAssignModal() {
    this.showAssignModal = false;
    this.selectedWorkoutForAssign = null;
    this.assignForm.reset();
  }

  async unassignMember(memberId: number) {
    if (confirm('Are you sure you want to unassign this member?')) {
      try {
        
        const assignedWorkout = this.getAssignedWorkoutForMember(memberId);
        if (assignedWorkout && assignedWorkout.id) {
          await this.workoutPlanService.unassignWorkoutFromMember(assignedWorkout.id, memberId);
          
          
          assignedWorkout.assignedTo = assignedWorkout.assignedTo?.filter(id => id !== memberId) || [];
          this.updateAssignedMembers();
          this.toastr.success('Member unassigned successfully!');
        }
      } catch (error) {
        console.error('Error unassigning member:', error);
        this.toastr.error('Failed to unassign member');
      }
    }
  }

  onMemberSelectionChange(memberId: number, event: any) {
    const isChecked = event.target.checked;
    const currentMemberIds = this.assignForm.get('memberIds')?.value || [];
    
    if (isChecked) {
      this.assignForm.patchValue({
        memberIds: [...currentMemberIds, memberId]
      });
    } else {
      this.assignForm.patchValue({
        memberIds: currentMemberIds.filter((id: number) => id !== memberId)
      });
    }
  }

  cancelEdit() {
    this.resetForms();
    this.toastr.info('Edit cancelled');
  }

  resetForms() {
    this.workoutForm.reset({
      title: '',
      description: '',
      duration: 30,
      difficulty: 'Intermediate'
    });
    this.exerciseForm.reset({
      sets: 3,
      reps: 10,
      restTime: 60,
      instructions: ''
    });
    this.currentExercises = [];
    this.isEditing = false;
    this.editingWorkoutId = 0;
    this.showExerciseForm = false;
  }

  getDifficultyBadgeClass(difficulty: string): string {
    const classes = {
      'Beginner': 'bg-success',
      'Intermediate': 'bg-primary',
      'Advanced': 'bg-warning',
      'Expert': 'bg-danger'
    };
    return classes[difficulty as keyof typeof classes] || 'bg-secondary';
  }

  markExerciseCompleted(exerciseIndex: number) {
    if (this.myAssignedWorkout) {
      this.toastr.success(`Completed: ${this.myAssignedWorkout.exercises[exerciseIndex].name}`);
    }
  }

  startWorkout() {
    if (this.myAssignedWorkout) {
      this.toastr.success(`Starting workout: ${this.myAssignedWorkout.title}`, 'Workout Started!', {
        timeOut: 3000,
        progressBar: true
      });
    } else {
      this.toastr.warning('No workout assigned');
    }
  }

  isMemberAssigned(memberId: number): boolean {
    return this.selectedWorkoutForAssign?.assignedTo?.includes(memberId) || false;
  }

  
  getAvailableMembers(): any[] {
    return this.trainerMembers.filter(member => 
      !this.selectedWorkoutForAssign?.assignedTo?.includes(member.id)
    );
  }

  
  getAssignedMembersCount(workout: WorkoutPlan): number {
    return workout.assignedTo?.length || 0;
  }

  
  hasExercises(workout: WorkoutPlan): boolean {
    return workout.exercises && workout.exercises.length > 0;
  }

  
  getMemberName(memberId: number): string {
    const member = this.trainerMembers.find(m => m.id === memberId);
    return member ? (member.fullName || member.name || 'Unknown Member') : 'Unknown Member';
  }

  
  getCurrentUserName(): string {
    return this.userProfile?.name || 'User';
  }
}