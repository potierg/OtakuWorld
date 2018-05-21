import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
	private loginInfos = {username:"", password:""};
	private error = false;

	constructor(private userService: UserService,
		private router: Router) { }

	ngOnInit() {
		if (this.userService.isUserLoad()) {
			return this.router.navigate(['']);
		}
	}

	logIn() {
		console.log(this.loginInfos);
		this.userService.logIn(this.loginInfos, (res) => {
			if (res) {
				window.location.href = '/';
			}
			this.error = true;
		});
	}
	
	signIn() {
		this.router.navigate(['signin']);
	}
}
