import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class DownloadService {
	private listDownload = [];

	constructor(private http: HttpClient) { }

	public addToDownload(listScans, mangaId, scanId, active = false) {

		var listDownloadNb = [];

		listScans.forEach(element => {
			if ((element.isDL && active ) || !active)
				listDownloadNb.push({tome:element.tome, chapter:element.chapter ? element.chapter : -1})
		});

		return this.http.post('http://127.0.0.1:8080/download/' + 666, { datas: { scans: listDownloadNb, mangaId: mangaId, scanId: scanId } } );
	}

	public getDownloadList() {
		return this.listDownload;
	}

	public addToDownloadList(obj) {
		this.listDownload.push(obj);
	}
}
