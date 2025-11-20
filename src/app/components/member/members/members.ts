import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CreateUpdateMember } from '../create-update-member/create-update-member';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { MemberService } from '../member-service';
import { TrainerService } from '../../trainer/trainer-service';

@Component({
  selector: 'app-members',
  imports: [CommonModule, RouterLink, RouterModule, FormsModule],
  templateUrl: './members.html',
  styleUrl: './members.scss'
})
export class Members {
  public selectedMember: any;
  public activeTabId: any;
  public bsModalRef: NgbModalRef;
  public membersList: any[] = [];
  public searchText: string = '';
  public trainersList: any[] = [];
  public selectedTrainer: any;
  constructor(
    private route: ActivatedRoute,
    private ngbModalService: NgbModal,
    private toastrService: ToastrService,
    private router: Router,
    private memberService: MemberService,
    private trainerService: TrainerService
  ) { }

  async ngOnInit() {
    await this.getMemberListAsync();
    await this.getTrainerListAsync();

    this.getSelectedMemberFromParams();
    this.getAssignedTrainer();

    this.setActive(1);
  }

  public applySearch() {
    if (!this.searchText) {
      this.getMemberListAsync();
    }
    else {
      this.membersList = this.membersList.filter(searchMembers => {
        return searchMembers.fullName.toLowerCase().includes(this.searchText.toLowerCase()) ||
          searchMembers.email.toLowerCase().includes(this.searchText.toLowerCase());
      })
    }
  }

  public getSelectedMemberFromParams() {
    this.route.params.subscribe(params => {
      const memberId = params['id'];
      this.selectedMember = this.membersList.find(m => m.id === +memberId);
  
      if (this.selectedMember && this.trainersList.length > 0) {
        this.getAssignedTrainer();
      }
    });
  }
  
  public async getMemberListAsync() {
    const response: any = await this.memberService.getMembersAsync();
    this.membersList = response;
  }

  public tabs = [
    { id: 1, title: "Member Details" },
  ]

  setActive(tabId: any) {
    this.activeTabId = tabId;
  }

  public async getTrainerListAsync() {
    const response: any = await this.trainerService.getTrainersAsync();
    console.log(response, 'rsp');
    this.trainersList = response;
  }

  public getAssignedTrainer() {
    this.selectedTrainer = this.trainersList.find(t => t.id === this.selectedMember.trainerId);
    console.log(this.selectedTrainer, 'gggg');

  }

  public async deleteMember(selectedMemberId: number) {
    await this.memberService.deleteMember(selectedMemberId);
    this.toastrService.success('Member deleted successfully!');
    this.getMemberListAsync();
    this.router.navigate(['/members']);
  }

  public createUpdateMemberModal(member?: any) {
    this.bsModalRef = this.ngbModalService.open(CreateUpdateMember, {
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });
    const comp = this.bsModalRef.componentInstance;
    if (member) {
      comp.isUpdating = true
      comp.setData(member);
    } else {
      comp.isCreating = true;
    }
    comp.emitData.subscribe(async (event: any) => {
      if (event === 'close') {
        this.bsModalRef.close();
      }
      if (event === 'record-saved') {
        this.toastrService.success('Member created successfully!');
        this.getMemberListAsync();
        this.bsModalRef.close();
      }

      if (event === 'record-updated') {
        this.toastrService.success('Member updated successfully!');

        const updatedId = this.selectedMember.id;

        await this.getMemberListAsync();
        await this.getTrainerListAsync();

        this.selectedMember = this.membersList.find(m => m.id === updatedId);
        this.getAssignedTrainer();

        this.bsModalRef.close();
      }

    })
  }
}
