import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CreateUpdateMember } from '../create-update-member/create-update-member';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { MemberService } from '../member-service';

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
  constructor(
    private route: ActivatedRoute,
    private ngbModalService: NgbModal,
    private toastrService: ToastrService,
    private router: Router,
    private memberService: MemberService
  ) { }

  async ngOnInit() { {
    await this.getMemberListAsync();
    this.getSelectedMemberFromParams();
    this.setActive(1);
  }
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
    {
      this.route.params.subscribe(params => {
        const memberId = params['id'];
        this.selectedMember = this.membersList.find(m => m.id === +memberId);
        console.log(memberId, 'sel', this.selectedMember);
        
      })
    }
  }
  public async getMemberListAsync() {
    const response:any = await this.memberService.getMembersAsync();
    console.log(response, 'rsp');
    this.membersList = response;
  }

  public tabs = [
    { id: 1, title: "Member Details" },
    { id: 2, title: "Payment History" },
    { id: 3, title: "Attendance" },
    { id: 4, title: "Progress Tracking" }
  ]

  setActive(tabId: any) {
    this.activeTabId = tabId;
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
    comp.emitData.subscribe((event: any) => {
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
        this.getMemberListAsync();
        this.selectedMember = comp.memberForm.value
        this.bsModalRef.close();
      }
    })
  }
}
