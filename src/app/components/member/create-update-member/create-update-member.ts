import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MemberService } from '../member-service';
import { TrainerService } from '../../trainer/trainer-service';

@Component({
  selector: 'app-create-update-member',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-update-member.html',
  styleUrl: './create-update-member.scss'
})
export class CreateUpdateMember {
  @Output() emitData = new EventEmitter;
  public record: 'create' | 'update' = 'create';
  public memberForm: FormGroup;
  public ready: boolean = false;
  public selectedMember: any;
  public isCreating:boolean=false;
  public isUpdating:boolean=false;
  public trainersList: any[] = [];
  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private memberService: MemberService,
    private trainerService: TrainerService
  ) {
    this.inItForm();
  }

  ngOnInit() {
    this.getTrainerListAsync();
  }

  public setData(selectedMember?: any) {
    this.selectedMember = selectedMember;
    if (selectedMember) {
      this.ready = true;
      this.memberForm.patchValue(selectedMember);
      this.record = 'update';
    }
  }

  public inItForm() {
    this.memberForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      userName: ['', null],
      phone: [''],
      address: [''],
      dateOfBirth: [null],
      trainerId: []
    })
    this.ready = true;
  }

  public async getTrainerListAsync() {
    const response: any = await this.trainerService.getTrainersAsync();
    console.log(response, 'rsp');
    this.trainersList = response;
  }


  public closeModal() {
    this.emitData.emit('close');
  }

  public async createMember() {
    try{
      const formValue = this.memberForm.value;
      const createPayload = {
        ...formValue,
        userName: formValue.userName?.trim() ? formValue.userName.trim() : null,
        dateOfBirth: formValue.dateOfBirth ? new Date(formValue.dateOfBirth).toISOString() : null
      }
      await this.memberService.createMember(createPayload);
      this.emitData.emit('record-saved');
    }
    catch(err:any){
      this.toastrService.error(err.message)
    }
  }

  public async updateMember() {
    try {
      const updatePayload = {
        ...this.memberForm.value,
        id: this.selectedMember.id
      }
      await this.memberService.updateMember(this.selectedMember.id, updatePayload);
      this.emitData.emit('record-updated')
    }

    catch(err:any){
      this.toastrService.error(err.message);
    }
  }
}
