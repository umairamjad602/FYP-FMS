import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { signUp } from '../../models/sign-up.model';
import { CommonModule } from '@angular/common';
import { Auth } from '../services/auth';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sign-up',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  standalone: true,
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss'
})
export class SignUp {
  createUserForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private toastrService: ToastrService,
    private router: Router
  ) { }

  ngOnInit() {
    this.initForm();
  }

  public initForm(model?: signUp) {
    this.createUserForm = this.fb.group({
      name: [model?.name || '', [Validators.required]],
      surName: [model?.surName || '', [Validators.required]],
      userName: [model?.userName || '', [Validators.required]],
      email: [model?.email || '', [Validators.required, Validators.email]],
      preferredLanguage: [model?.preferredLanguage || '', [Validators.required]],
      password: [model?.password || '', [Validators.required]]
    });
  }

  get name() { return this.createUserForm.get('name'); }
  get surName() { return this.createUserForm.get('surName'); }
  get userName() { return this.createUserForm.get('userName'); }
  get email() { return this.createUserForm.get('email'); }
  get preferredLanguage() { return this.createUserForm.get('preferredLanguage'); }
  get password() { return this.createUserForm.get('password'); }

  public async createUser() {
    const payload = this.createUserForm.value;
    try {
      await firstValueFrom(this.authService.createUser(payload));
      this.toastrService.success("User created successfully!");
      const loginPayload = { email: payload.email, password: payload.password };
      await firstValueFrom(this.authService.loginUser(loginPayload));
  
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      if (err.status === 409) {
        this.toastrService.error('User with this email or username already exists.');
      } else if (err.status === 400) {
        this.toastrService.error('Bad Request. Please check your inputs.');
      } else if (err.status === 0) {
        this.toastrService.error('CORS error or server not reachable.');
      } else {
        this.toastrService.error(err.error || 'Something went wrong!');
      }
    }
  }
  
}
