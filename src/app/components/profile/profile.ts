import { Component } from '@angular/core';
import { MemberService } from '../member/member-service';
import { Auth } from '../../auth/services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {
  public userData: any = [];
  public currentDate = new Date();
  constructor(
    private authService: Auth
  ) { }

  ngOnInit(){
    this.getProfile();
  }

  public async getProfile(){
    const response = await this.authService.getloggedInUserAsync();
    console.log(response, 'rip');
    this.userData = response;
    
  }
}
