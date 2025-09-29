import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-update-member',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-update-member.html',
  styleUrl: './create-update-member.scss'
})
export class CreateUpdateMember {
 @Output() emitData = new EventEmitter;
 public record: 'create' | 'update' = 'create';
 public memberForm : FormGroup;
 public ready: boolean = false;
 constructor(
  private fb: FormBuilder,
  private toastrService: ToastrService
 ){
  this.inItForm();
 }

 ngOnInit(){
 }

 public setData(selectedMember?: any) {
  console.log(selectedMember);
  if(selectedMember){
    this.ready = true;
    this.memberForm.patchValue(selectedMember);
    this.record = 'update';
  }
 }

 public inItForm(){
  this.memberForm = this.fb.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    username: [''],
    phone: [''],
    address: [''],
    dateOfBirth: [''],
  })
  this.ready = true;
 }


 public closeModal() {
  this.emitData.emit('close');
 }

 public createUpdateMember() {
   if(this.record === 'update'){
    this.emitData.emit('record-updated');
    // call update api
  }
  else {
    this.emitData.emit('record-saved');
    // create api
  }
 }
}
