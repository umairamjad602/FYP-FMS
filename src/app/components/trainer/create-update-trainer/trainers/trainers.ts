import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CreateUpdateTrainer } from '../create-update-trainer';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { TrainerService } from '../../trainer-service';
import { MemberService } from '../../../member/member-service';

@Component({
  selector: 'app-trainers',
  imports: [CommonModule, RouterLink, RouterModule, FormsModule],
  templateUrl: './trainers.html',
  styleUrl: './trainers.scss'
})
export class Trainers {
  public selectedTrainer: any;
  public activeTabId: any;
  public bsModalRef: NgbModalRef;
  public trainersList: any[] = [];
  public searchText: string = '';
  public assignedMembers: any[] = [];
  public membersList: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private ngbModalService: NgbModal,
    private toastrService: ToastrService,
    private router: Router,
    private trainerService: TrainerService,
    private memberService: MemberService
  ) { }

  async ngOnInit() {
    await this.getTrainerListAsync();
    await this.getMemberListAsync(); // load members
    
    this.getSelectedTrainerFromParams();
    this.getAssignedMembers(); // filter members
    
    this.setActive(1);
  }
  

  public applySearch() {
    if (!this.searchText) {
      this.getTrainerListAsync();
    } else {
      this.trainersList = this.trainersList.filter(searchTrainer => {
        return searchTrainer.fullName.toLowerCase().includes(this.searchText.toLowerCase()) ||
          searchTrainer.email.toLowerCase().includes(this.searchText.toLowerCase());
      });
    }
  }

  public getSelectedTrainerFromParams() {
    this.route.params.subscribe(async params => {
      const trainerId = params['id'];
      this.selectedTrainer = this.trainersList.find(t => t.id === +trainerId);
  
      await this.getMemberListAsync();
      this.getAssignedMembers();
    });
  }
  

  public async getTrainerListAsync() {
    const response: any = await this.trainerService.getTrainersAsync();
    console.log(response, 'rsp');
    this.trainersList = response;
  }

  public async getMemberListAsync() {
    const response: any = await this.memberService.getMembersAsync();
    // console.log(response, 'rsp');
    this.membersList = response;
  }

  public async getAssignedMembers() {
    const trainerId = this.selectedTrainer.id;
  
    this.assignedMembers = this.membersList.filter(m => m.trainerId === trainerId);
    console.log("Assigned Members:", this.assignedMembers);
  }
  

  public tabs = [
    { id: 1, title: "Trainer Details" },
    { id: 2, title: "Assigned Members" },
    { id: 3, title: "Schedule" },
    { id: 4, title: "Performance" }
  ];

  setActive(tabId: any) {
    this.activeTabId = tabId;
  }

  public async deleteTrainer(selectedTrainerId: number) {
    await this.trainerService.deleteTrainer(selectedTrainerId);
    this.toastrService.success('Trainer deleted successfully!');
    this.getTrainerListAsync();
    this.router.navigate(['/trainers']);
  }

  public createUpdateTrainerModal(trainer?: any) {
    this.bsModalRef = this.ngbModalService.open(CreateUpdateTrainer, {
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });
    const comp = this.bsModalRef.componentInstance;
    if (trainer) {
      comp.isUpdating = true;
      comp.setData(trainer);
    } else {
      comp.isCreating = true;
    }
    comp.emitData.subscribe((event: any) => {
      if (event === 'close') {
        this.bsModalRef.close();
      }
      if (event === 'record-saved') {
        this.toastrService.success('Trainer created successfully!');
        this.getTrainerListAsync();
        this.bsModalRef.close();
      }
      if (event === 'record-updated') {
        this.toastrService.success('Trainer updated successfully!');
        this.getTrainerListAsync();
        this.selectedTrainer = comp.trainerForm.value;
        this.bsModalRef.close();
      }
    });
  }
}
