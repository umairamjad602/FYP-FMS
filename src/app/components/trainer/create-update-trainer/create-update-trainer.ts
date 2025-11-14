import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TrainerService } from '../trainer-service';

@Component({
  selector: 'app-create-update-trainer',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-update-trainer.html',
  styleUrl: './create-update-trainer.scss'
})
export class CreateUpdateTrainer {
  @Output() emitData = new EventEmitter();
  public record: 'create' | 'update' = 'create';
  public trainerForm: FormGroup;
  public ready: boolean = false;
  public selectedTrainer: any;
  public isCreating: boolean = false;
  public isUpdating: boolean = false;

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private trainerService: TrainerService
  ) {
    this.initForm();
  }

  ngOnInit() {}

  public setData(selectedTrainer?: any) {
    this.selectedTrainer = selectedTrainer;
    if (selectedTrainer) {
      this.ready = true;
      this.trainerForm.patchValue(selectedTrainer);
      this.record = 'update';
    }
  }

  public initForm() {
    this.trainerForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      userName: ['', null],
      phone: [''],
      address: [''],
      dateOfBirth: ['', null],
      password: ['', [Validators.required]]
    });
    this.ready = true;
  }

  public closeModal() {
    this.emitData.emit('close');
  }

  public async createTrainer() {
    try {
      const formValue = this.trainerForm.value;
      const createPayload = {
        ...formValue,
        userName: formValue.userName?.trim() ? formValue.userName.trim() : null,
        dateOfBirth: formValue.dateOfBirth ? new Date(formValue.dateOfBirth).toISOString() : null
      };
      await this.trainerService.createTrainer(createPayload);
      this.emitData.emit('record-saved');
    } catch (err: any) {
      this.toastrService.error(err.message);
    }
  }

  public async updateTrainer() {
    try {
      const updatePayload = {
        ...this.trainerForm.value,
        id: this.selectedTrainer.id
      };
      await this.trainerService.updateTrainer(this.selectedTrainer.id, updatePayload);
      this.emitData.emit('record-updated');
    } catch (err: any) {
      this.toastrService.error(err.message);
    }
  }
}
