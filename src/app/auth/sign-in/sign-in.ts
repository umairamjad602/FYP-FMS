import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { signIn } from '../../models/sign-up.model';
import { AbstractBaseComponent } from '../../core/class/abstract.base.component';
import { CommonModule } from '@angular/common';
import { Auth } from '../services/auth';
import { firstValueFrom } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sign-in',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  standalone: true,
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss'
})
export class SignIn extends AbstractBaseComponent {
  signInForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private toastrService: ToastrService,
    private router: Router
  ) {
    super();
  }
  ngOnInit() {
    this.inItForm();
  }

  get email() {
    return this.signInForm.get('email');
  }

  get password() {
    return this.signInForm.get('password');
  }

  public inItForm(model?: signIn) {
    this.signInForm = this.fb.group({
      email: [this.getValue(model?.email, ''), [Validators.email, Validators.required]],
      password: [this.getValue(model?.password, ''), Validators.required]
    });
  }

  public async signInUser() {
    try {
      await firstValueFrom(this.authService.loginUser(this.signInForm.value));
      this.toastrService.success('Logged in successfully');
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      if (error.status === 401) {
        this.toastrService.error('Invalid email or password');
      } else {
        this.toastrService.error('Something went wrong, please try again');
      }
    }
  }
}
