import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
	private userInfos = {nom:"", username:"", password:""};
  
  constructor(private userService: UserService,
		private router: Router) { }

  ngOnInit() {
    if (this.userService.isUserLoad()) {
			return this.router.navigate(['home']);
		}
  }

  signIn() {
		this.userService.signIn(this.userInfos, (res) => {
			if (res) {
				return this.router.navigate(['home']);
			}
		});
  }
  
  logIn() {
    this.router.navigate(['home/login']);    
  }
}
