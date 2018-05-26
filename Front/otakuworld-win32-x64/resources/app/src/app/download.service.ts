import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment'

@Injectable()
export class DownloadService {
	private listDownload = [];
	private loadDone = false;
	public downloading = false;
	
	constructor(private http: HttpClient) { }

	public isListLoad() {
		return this.loadDone;
	}

	public loadDownloadsByUserId() {
		return this.http.get(environment.serverIp + 'downloads/' + 666);
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

	public async startDownload() {
		this.downloading = true;
		for (var keyDl in this.listDownload) {
			var listPages = [];

			console.log(this.listDownload[keyDl]);

			while (this.listDownload[keyDl].scans.length > 0) {
				console.log(this.listDownload[keyDl].scans[0]);
				this.listDownload[keyDl].scans = this.listDownload[keyDl].scans.slice(1);
			}

			return;

		}
		this.downloading = false;

	}

	public stopDownload() {
		this.downloading = false;
	}
}
