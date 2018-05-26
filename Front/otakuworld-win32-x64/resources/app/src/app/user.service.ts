import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment'

@Injectable()
export class UserService {

	private userId = null;
	private user = null;

	constructor(private http: HttpClient) { }

	public loadUser(callback) {
		var id = localStorage.getItem('userId');
		if (id != null && id != 'null') {
			this.userId = id;
			this.http.get(environment.serverIp + 'user/' + this.userId).subscribe((user) => {
				this.user = user;
				callback();
			});
		} else {
			callback();
		}
	}

	public isUserLoad() {
		if (!this.user)
			return false;
		return true;
	}

	public getUser() {
		return this.user;
	}

	public getUserId() {
		var id = localStorage.getItem('userId');
		return id == null || id == 'null' ? -1 : id;
	}

	public logIn(userInfo, callback) {
		var th = this;
		this.http.post(environment.serverIp + 'login/', userInfo).subscribe((id: string) => {
			if (id) {
				localStorage.setItem('userId', id);
				this.loadUser(() => {
					return callback(true);					
				});
			}
			callback(false);
		});
	}

	public signIn(userInfo, callback) {
		var th = this;
		this.http.post(environment.serverIp + 'signin/', userInfo).subscribe((id: string) => {
			if (id) {
				localStorage.setItem('userId', id);
				this.loadUser(() => {
					return callback(true);					
				});
			}
			callback(false);
		});
	}

	public logOut() {
		localStorage.setItem('userId', null);
		this.user = null;
		this.userId = null;
	}
}
