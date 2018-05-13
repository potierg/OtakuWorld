import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const userID = "5af746ad4914c73020c5bfbe";

@Injectable()
export class UserService {

	private userId = userID;
	private user = null;

	constructor(private http: HttpClient) { }

	public loadUser() {
		this.http.get('http://127.0.0.1:8080/user/' + this.userId).subscribe((user) => {
			this.user = user;
		});
	}

	public isUserLoad() {
		if (!this.user)
			return false;
		return true;
	}

	public getUser() {
		return this.user;
	}
}
