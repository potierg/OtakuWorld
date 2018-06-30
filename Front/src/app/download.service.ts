import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment'
import { UserService } from './user.service';

const PORT = '4521';
const USERID = 666;

@Injectable()
export class DownloadService {
	private listDownload = [];
	private loadDone = false;
	public downloading = false;
	
	constructor(private http: HttpClient, private user: UserService, private zone:NgZone) { }

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

		this.http.post(environment.serverIp + 'download/' + this.user.getUserId(), { datas: { scans: listDownloadNb, mangaId: mangaId, scanId: scanId } } ).subscribe(res => {
			this.listDownload.push(res);
		});
	}

	public getDownloadList() {
		return this.listDownload;
	}

	public addToDownloadList(obj) {
		this.listDownload.push(obj);
	}

	public initDownload(id, isFirstTime = true, nbTime = 0, idDownload = 0) {
		if (isFirstTime)
			this.listDownload[id].id = -1;
		var sizeChunk = 10;

		if ((sizeChunk * nbTime) > this.listDownload[id].scans.length) {
			this.listDownload[id].state = false;
			return ;
		}

		var temparray;
		temparray = this.listDownload[id].scans.slice((sizeChunk * nbTime), (sizeChunk * (nbTime + 1)));

		var th = this;
		var url = 'http://127.0.0.1:' + PORT + '/setList' + (!isFirstTime ? 'WithId/' + idDownload : '');

		this.http.post(url, { list: { scans: temparray, size: temparray.length, done: 0 }, path: isFirstTime ? this.user.getPath() : null, nomManga: isFirstTime ? this.listDownload[id].nom : null } ).subscribe(function (idDL :any) {
			if (isFirstTime) {
				th.listDownload[id].state = null;
				th.listDownload[id].id = idDL.id;
				th.listDownload[id].percent = 0;
			}

			return th.initDownload(id, false, nbTime + 1, idDL.id);
		});	
	}

	public startDownload(id) {
		this.downloading = true;
		this.http.get('http://127.0.0.1:' + PORT + '/start/' + id).subscribe(function(resp) {
		});
	}

	public stopDownload(id) {
		this.downloading = false;
		this.http.get('http://127.0.0.1:' + PORT + '/stop/' + id).subscribe(function() {
		});
	}

	public getStatusDownload(id) {
		return this.http.get('http://127.0.0.1:' + PORT + '/status/' + id);
	}

	public startDownloadList(id) {
		this.downloading = true;
	}

	public stopDownloadList(id) {
		this.downloading = false;
		this.stopDownload(this.listDownload[id].id);
		this.listDownload[0].state = false;
	}

	public async processLoop() {
		var th = this;
		if (this.downloading == true) {
			if (this.listDownload.length == 0) {
				this.downloading = false;
			} else {
				if (!this.listDownload[0].id) {
					this.initDownload(0);
				}

				if (this.listDownload[0].state === false ) {
					this.startDownload(this.listDownload[0].id);
					this.listDownload[0].state = true;
				} 
				
				if (this.listDownload[0].state !== null && this.listDownload[0].state !== undefined) {
					this.getStatusDownload(this.listDownload[0].id).subscribe(function (resp :any) {
						if (resp.p > -1 && th.listDownload[0].state) {
							th.listDownload[0].percent = Math.floor(resp.p);
						}
						else if (resp.p == -1) {
							th.deleteDl(th.listDownload[0]);
						}
					});	
				}
			}
		}

		return setTimeout( () => {
			return this.processLoop()
		}, 1000 );
	}

	public deleteDl(dl) {
		for (var key = 0; key < this.listDownload.length; key++) {
			if (this.listDownload[key]._id == dl._id) {
				var th = this;
				this.http.delete(environment.serverIp + 'download/' + this.user.getUserId() + '/' + dl._id).subscribe(res => {
					th.listDownload.splice(key, 1);
				});
				break;
			}
		}
	}
}
