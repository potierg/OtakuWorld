import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment'
import { UserService } from './user.service';

const PORT = '4521';

@Injectable()
export class DownloadService {
	private listDownload = [];
	private loadDone = false;
	public downloading = false;
	
	constructor(private http: HttpClient, private user: UserService) { }

	public isListLoad() {
		return this.loadDone;
	}

	public loadDownloadsByUserId() {
		return this.http.get(environment.serverIp + 'downloads/' + this.user.getUserId());
	}

	public setList(listDownload) {
		this.listDownload = listDownload;
		this.loadDone = true;
	}

	public addToDownload(listScans, mangaId, scanId, active = false) {

		var listDownloadNb = [];

		listScans.forEach(element => {
			if ((element.isDL && active ) || !active)
				listDownloadNb.push({tome:element.tome, chapter:element.chapter ? element.chapter : -1});
		});

		return this.http.post(environment.serverIp + 'download/' + 666, { datas: { scans: listDownloadNb, mangaId: mangaId, scanId: scanId } } );
	}

	public getDownloadList() {
		return this.listDownload;
	}

	public addToDownloadList(obj) {
		this.listDownload.push(obj);
	}

	public initDownload(id) {
		return this.http.post('http://127.0.0.1:' + PORT + '/setList', { list: { scans: this.listDownload[0].scans, size: this.listDownload[0].scans.length, done: 0 } } );
	}

	public startDownload(id) {
		this.downloading = true;
		return this.http.get('http://127.0.0.1:' + PORT + '/start/' + id);
	}

	public stopDownload(id) {
		this.downloading = false;
		return this.http.get('http://127.0.0.1:' + PORT + '/stop/' + id);
	}

	public getStatusDownload(id) {
		return this.http.get('http://127.0.0.1:' + PORT + '/status/' + id);
	}
}
