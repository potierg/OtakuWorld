import { Component, OnInit, ViewChild } from '@angular/core';
import { DownloadService } from '../download.service';
import { NgProgress } from 'ngx-progressbar';

@Component({
	selector: 'app-download',
	templateUrl: './download.component.html',
	styleUrls: ['./download.component.css']
})
export class DownloadComponent implements OnInit {
	private loading = true;
	private downloadList = null;
	private currentDl = { chap: '', percent: 0 };

	
	constructor(private downloadService: DownloadService, private ngProgress: NgProgress) { }

	ngOnInit() {
	}
	
	requestState(id) {
		var th = this;
		this.downloadService.getStatusDownload(id).subscribe(function (resp :any) {
			if (resp.p > -1 && th.downloadService.getDownloadList()[0].state) {
				console.log(Math.floor(resp.p));
				th.downloadService.getDownloadList()[0].percent = Math.floor(resp.p);
				th.ngProgress.set(Math.floor(resp.p) / 100);
				setTimeout(th.requestState(id), 100);
			}
			else if (resp.p == -1) {
				console.log("END");
				th.ngProgress.done();
				th.downloadService.getDownloadList().splice(0, 1);
			}
			else 
				console.log("STOP");
		});
	}

	startDownload() {
		var th = this;
		console.log(th.downloadService.getDownloadList()[0]);
		if (!th.downloadService.getDownloadList()[0].id) {
			th.ngProgress.start();
			th.downloadService.initDownload(0).subscribe(function (id :any) {
				th.downloadService.getDownloadList()[0].id = id.id;
				th.downloadService.getDownloadList()[0].state = true;
				th.downloadService.startDownload(id.id).subscribe(function(resp) {
					th.requestState(id.id);
				});
			});	
		}  else {
			th.downloadService.startDownload(th.downloadService.getDownloadList()[0].id).subscribe(function(resp) {
				th.downloadService.getDownloadList()[0].state = true;
				th.requestState(th.downloadService.getDownloadList()[0].id);
			});
		}
	}

	stopDownload() {
		var th = this;
		th.downloadService.stopDownload(th.downloadService.getDownloadList()[0].id).subscribe(function() {
			th.downloadService.getDownloadList()[0].state = false;
		});
	}
}
