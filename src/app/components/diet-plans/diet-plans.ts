import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DietPlanService } from '../../services/diet/diet-plan';
import { WorkoutPlanService } from '../../services/workout/workout-plan-service';
import { Auth } from '../../auth/services/auth';

@Component({
  selector: 'app-diet-plans',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './diet-plans.html',
  styleUrls: ['./diet-plans.scss']
})
export class DietPlans implements OnInit {
  role: string;
  dietPlans: any = [];
  assignedMembers: any = [];
  dietForm: FormGroup;
  assignForm: FormGroup;
  dietAssignments: any = {};

  isEditing: boolean = false;
  editingPlanId: number | null = null;
  showAssignModal: boolean = false;
  selectedPlanForAssign: any = null;
  public userProfile: any;

  constructor(
    private fb: FormBuilder,
    private dietPlanService: DietPlanService,
    private workoutPlanService: WorkoutPlanService,
    private authService: Auth
  ) {
    this.role = localStorage.getItem('role') || 'Member';
    this.initializeForm();
    this.initializeAssignForm();
  }

  async ngOnInit() {
    await this.getCurrentUser();
    await this.loadDietPlans();
    if (this.isTrainer()) {
      this.loadTrainerMembers();
    }
  }

  async getCurrentUser() {
    try {
      this.userProfile = await this.authService.getloggedInUserAsync();
      console.log('Current user:', this.userProfile);
    } catch (error) {
      console.error('Failed to get user profile:', error);
    }
  }

  initializeForm() {
    this.dietForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      calories: ['', [Validators.required]],
      protein: ['', [Validators.required]],
      carbs: ['', [Validators.required]],
      fats: ['', [Validators.required]]
    });
  }

  initializeAssignForm() {
    this.assignForm = this.fb.group({
      memberIds: [[], [Validators.required]]
    });
  }

  async loadDietPlans() {
    try {
      if (this.isTrainer() && this.userProfile) {
        this.dietPlans = await this.dietPlanService.getDietPlansByTrainer(this.userProfile.id);
        console.log('Trainer diet plans loaded:', this.dietPlans);
      } else {
        this.dietPlans = await this.dietPlanService.getDietPlanByMember(this.userProfile.id);
        console.log('All diet plans loaded:', this.dietPlans);
      }
      
      this.dietPlans.forEach((plan: any) => {
        this.dietAssignments[plan.id] = plan.assignedTo || [];
      });
    } catch (error) {
      console.error('Failed to load diet plans:', error);
      this.dietPlans = [];
    }
  }

  async loadTrainerMembers() {
    try {
      if (this.userProfile) {
        this.assignedMembers = await this.dietPlanService.getMembersByTrainer(this.userProfile.id);
        console.log('Trainer members loaded:', this.assignedMembers);
      }
    } catch (error) {
      console.error('Failed to load trainer members:', error);
      this.assignedMembers = [];
    }
  }

  isTrainer(): boolean {
    return this.role === 'Trainer';
  }

  isMember(): boolean {
    return this.role === 'Member';
  }

  async onSubmit() {
    if (this.dietForm.valid) {
      try {
        const formData = this.dietForm.value;
        const payload = this.prepareDietPayload(formData);
        const updatePayload =  {...this.prepareDietPayload(formData), id: this.editingPlanId};

        if (this.isEditing && this.editingPlanId) {
          console.log(this.editingPlanId, 'editing plan id');
          
          await this.dietPlanService.updateDietPlan(this.editingPlanId, updatePayload);
        } else {
          await this.dietPlanService.createDietPlan(payload);
        }

        this.resetForm();
        await this.loadDietPlans();
      } catch (error) {
        console.error('Failed to save diet plan:', error);
      }
    }
  }

  prepareDietPayload(formData: any) {
    return {
      title: formData.title,
      description: formData.description,
      calories: Number(formData.calories),
      protein: formData.protein,
      carbs: formData.carbs,
      fats: formData.fats,
      trainerId: this.userProfile?.id,
      createdBy: this.userProfile?.name || 'Current Trainer',
      createdAt: new Date().toISOString(),
      status: 'active',
      targetAudience: 'general',
      tags: ['diet', 'nutrition'],
      isActive: true,
      assignedTo: []
    };
  }

  editPlan(plan: any) {
    this.isEditing = true;
    this.editingPlanId = plan.id;
    this.dietForm.patchValue({
      title: plan.title,
      description: plan.description,
      calories: plan.calories,
      protein: plan.protein,
      carbs: plan.carbs,
      fats: plan.fats
    });
  }

  async deletePlan(planId: number) {
    try {
      await this.dietPlanService.deleteDietPlan(planId);
      await this.loadDietPlans();
    } catch (error) {
      console.error('Failed to delete diet plan:', error);
    }
  }

  openAssignModal(plan: any) {
    if (this.isTrainer() && plan.trainerId !== this.userProfile?.id) {
      console.error('Cannot assign diet plan created by another trainer');
      return;
    }

    this.selectedPlanForAssign = plan;
    this.assignForm.patchValue({
      memberIds: this.dietAssignments[plan.id] || []
    });
    this.showAssignModal = true;
  }

  closeAssignModal() {
    this.showAssignModal = false;
    this.selectedPlanForAssign = null;
    this.assignForm.reset();
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

  isMemberAssigned(memberId: number): boolean {
    if (!this.selectedPlanForAssign) return false;
    const assigned = this.dietAssignments[this.selectedPlanForAssign.id] || [];
    return assigned.includes(memberId);
  }

  async assignDietToMembers() {
    console.log(this.assignForm.value, 'assign form value');
    if (this.assignForm.valid && this.selectedPlanForAssign) {
      try {
        const memberIds = this.assignForm.value.memberIds;
        this.dietAssignments[this.selectedPlanForAssign.id] = memberIds;

        for (const memberId of memberIds) {
          const payload = {
            dietPlanId: this.selectedPlanForAssign.id,
            memberId: memberId
          };
          await this.dietPlanService.assignDietToMember(payload);
        }

        this.closeAssignModal();
        console.log('Diet assigned successfully!');
      } catch (error) {
        console.error('Error assigning diet:', error);
      }
    } else {
      console.log('Please select at least one member to assign');
    }
  }

  isMyPlan(plan: any): boolean {
    return plan.trainerId === this.userProfile?.id;
  }

  getAssignedCount(plan: any): number {
    return this.dietAssignments[plan.id]?.length || 0;
  }

  getTrainerName(): string {
    return this.userProfile?.name || 'Trainer';
  }

  resetForm() {
    this.dietForm.reset();
    this.isEditing = false;
    this.editingPlanId = null;
  }
}