import { Component, OnInit, ViewChild } from '@angular/core';
import { DownloadService } from '../download.service';
import { Observable } from 'rxjs/Observable';

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
	
	requestState(id) {
		var th = this;
		this.downloadService.getStatusDownload(id).subscribe(function (resp :any) {
			if (resp.p > -1 && th.downloadService.getDownloadList()[0].state) {
				th.downloadService.getDownloadList()[0].percent = Math.floor(resp.p);
				Observable.interval(100)
				.take(1).subscribe(i => { 
					th.requestState(id)
				});
			}
			else if (resp.p == -1) {
				th.downloadService.getDownloadList().splice(0, 1);
				return th.startDownload();
			}
		});
	}

	startDownload() {
		var th = this;

		if (th.downloadService.getDownloadList().length == 0) {
			th.downloadService.downloading = false;
			return ;
		}

		if (!th.downloadService.getDownloadList()[0].id) {
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
