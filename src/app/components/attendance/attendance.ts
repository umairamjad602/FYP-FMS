import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DietPlanService } from '../../services/diet/diet-plan';
import { Auth } from '../../auth/services/auth';
import { WorkoutPlanService } from '../../services/workout/workout-plan-service';
import { AttendanceService } from '../../services/attendance/attendance';

interface Member {
  id: string;
  name: string;
  plan: string;
  sessionTime: string;
  status: 'Present' | 'Absent' | 'Pending';
}

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.html',
  styleUrls: ['./attendance.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class Attendance implements OnInit {
  currentDate: Date = new Date();
  selectedDate: string;
  searchTerm: string = '';

  filteredMembers: any[] = [];
  public userProfile: any;
  public assignedMembers: any[] = [];
  status: string;
  public attendanceHistory: any[] = [];

  constructor(
    private workoutService: WorkoutPlanService,
    private authService: Auth,
    private attendanceService: AttendanceService
  ) {}

  async ngOnInit() {

    this.selectedDate = this.formatDate(this.currentDate);
    this.filteredMembers = [...this.assignedMembers];
    await this.getloggedInUserAsync();
    this.getMembersByTrainer();
    this.getAttendanceHistory();
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  public async  getloggedInUserAsync() {
    const user = await this.authService.getloggedInUserAsync();
    this.userProfile = user;
    console.log('Logged in user profile:', this.userProfile);
    
  }
  
  public async getMembersByTrainer() {
    const respoonse:any = await this.workoutService.getMembersByTrainer(this.userProfile.id);
    this.assignedMembers = respoonse;
    
  }

  onDateChange() {
    console.log('Date changed to:', this.selectedDate);
    // In real app, fetch attendance data for selected date
  }

  filterMembers() {
    if (!this.searchTerm) {
      this.filteredMembers = [...this.assignedMembers];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredMembers = this.assignedMembers.filter(member => 
      member.name.toLowerCase().includes(term) || 
      member.id.toLowerCase().includes(term)
    );
  }

  markPresent(member: Member) {
    member.status = 'Present';
  }

  markAbsent(member: Member) {
    member.status = 'Absent';
  }

  getStatusClass(status: string): string {
    return this.status = `${status}`;
  }

  getPresentCount(): number {
    return this.assignedMembers.filter(m => m.status === 'Present').length;
  }

  getAbsentCount(): number {
    return this.assignedMembers.filter(m => m.status === 'Absent').length;
  }

  getPendingCount(): number {
    return this.assignedMembers.filter(m => m.status === 'Pending').length;
  }

  resetAttendance() {
    if (confirm('Are you sure you want to reset all changes?')) {
      this.assignedMembers.forEach(member => {
        member.status = 'Pending';
      });
    }
  }

 async getAttendanceHistory(){
  const response = await this.attendanceService.getAttendanceHistory();
  this.attendanceHistory = response as any[];
  console.log( response,'attendance history');
  
  }

  public async saveAttendance(member:any) {
    // In real app, send data to backend
    console.log(this.userProfile.fullName,member[0],this.status,  'googg');
    
    const payload = {
      memberId: member[0].id,
      memberName: member[0].fullName,
      trainerId: this.userProfile.id,
      markedBy: this.userProfile.name,
      status: this.status
    }
    await this.attendanceService.markAttendance(payload);
    this.getAttendanceHistory();
    console.log('Saving attendance data:', this.assignedMembers);
    alert('Attendance saved successfully!');
  }
}