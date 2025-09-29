import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CreateUpdateMember } from '../create-update-member/create-update-member';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-members',
  imports: [CommonModule, RouterLink, RouterModule],
  templateUrl: './members.html',
  styleUrl: './members.scss'
})
export class Members {
  public selectedMember: any;
  public activeTabId: any;
  public bsModalRef: NgbModalRef;
  public membersList: any[] = [];
  constructor(
    private route: ActivatedRoute,
    private ngbModalService: NgbModal,
    private toastrService: ToastrService,
    private router: Router
   ) {}

   ngOnInit() {
     this.getMemberListAsync();
     this.getSelectedMemberFromParams();
     this.setActive(1);
   }

   public getSelectedMemberFromParams() {
    {
      this.route.params.subscribe(params => {
        const memberId = params['id'];
        this.selectedMember = this.membersList.find(m => m.id === +memberId);
      })
     }
   }
   public getMemberListAsync() {
     this.membersList = [
       { id: 1, fullName: 'John Doe', email: 'Gold@mail', joinDate: '2023-01-15' },
       { id: 2, fullName: 'Jane Smith', email: 'Silver@mail', joinDate: '2023-02-20' },
       { id: 3, fullName: 'Mike Johnson', email: 'Platinum@mail', joinDate: '2023-03-10' }
     ];
   }

  public tabs = [
    {id:1, title: "Member Details"},
    {id:2, title: "Payment History"},
    {id:3, title: "Attendance"},
    {id:4, title: "Progress Tracking"}
  ]

  setActive(tabId: any) {
    this.activeTabId = tabId;
  }

  public deleteMember(selectedMemberId: number) {
    this.toastrService.success('Member deleted successfully!');
    this.getMemberListAsync();
    this.router.navigate(['/members']);
  }

  public createUpdateMemberModal(member?: any) {
    this.bsModalRef = this.ngbModalService.open(CreateUpdateMember,{
        size: 'lg',
        centered: true,
        backdrop: 'static'
      });
    const comp = this.bsModalRef.componentInstance;
    if(member) {
      comp.record = 'update';
      comp.setData(member);
    } else {
      comp.record = 'create';
    }
    comp.emitData.subscribe((event: any) => {
      if(event === 'close') {
        this.bsModalRef.close();
      }
      if(event === 'record-saved') {
        this.toastrService.success('Member created successfully!');
        this.getMemberListAsync();
        this.bsModalRef.close();
      }
      if(event === 'record-updated') {
        this.toastrService.success('Member updated successfully!');
        this.getMemberListAsync();
        this.bsModalRef.close();
      }
    })
  }
}
