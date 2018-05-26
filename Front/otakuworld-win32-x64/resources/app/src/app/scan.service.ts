import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ResponseContentType, RequestOptions } from '@angular/http';
import { environment } from '../environments/environment'

@Injectable()
export class ScanService {

	constructor(private http: HttpClient) { }

	getById(id) {
		return this.http.get(environment.serverIp + 'manga/chapters/' + id);
	}

	getListScanByIdAndChapter(id, tome, chapitre) {
		var url = "";

		if (chapitre)
			url = environment.serverIp + "manga/" + id + "/chapters/" + tome + "/" + chapitre + "/scans";
		else
			url = environment.serverIp + "manga/" + id + "/chapters/" + tome + "/0/scans";

		return this.http.get(url);
	}

	getImgWithLink(imageUrl) {
		return this.http.post(environment.serverIp + "getImg",
			{ link: imageUrl },
			{
				responseType: "blob"
			}
		);
	}
}
