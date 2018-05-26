import { Component, OnInit } from '@angular/core';
import { DownloadService } from '../download.service';

@Component({
	selector: 'app-download',
	templateUrl: './download.component.html',
	styleUrls: ['./download.component.css']
})
export class DownloadComponent implements OnInit {

	private loading = true;
	private downloadList = null;
	private currentDl = { chap: '', percent: 0 };

	constructor(private downloadService: DownloadService) { }

	ngOnInit() {
	}
	
	startDownload() {
		this.downloadService.startDownload();
	}

	stopDownload(index) {
		this.downloadService.stopDownload();
	}
}
