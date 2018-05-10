import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MangasService } from '../mangas.service';
import { ScanService } from '../scan.service';
import { DownloadService } from '../download.service';
import {Location} from '@angular/common';

@Component({
	selector: 'app-detail-manga',
	templateUrl: './detail-manga.component.html',
	styleUrls: ['./detail-manga.component.css']
})
export class DetailMangaComponent implements OnInit {

	private manga: any;
	private isLoad = false;
	private activeTab = 0;
	private isAllCheck = false;
	private isFavorite = false;

	constructor(private route: ActivatedRoute,
		private mangasService: MangasService,
		private scanService: ScanService,
		private downloadService: DownloadService,
		private _location: Location) {
	}

	ngOnInit() {
		this.route.params.subscribe(params => {
			this.mangasService.getMangaById(params.id).subscribe(manga => {
				this.manga = manga;
				this.format();
				this.isLoad = true;
				for (var dataKey in this.manga.data) {
					this.manga.data[dataKey].id = dataKey;
					this.loadScan(this.manga.data[dataKey].data.scanId, dataKey);
				}
			});
		});
	}

	loadScan(scanId, dataKey) {
		this.scanService.getById(scanId).subscribe(scan => {
			this.manga.data[dataKey].isActive = dataKey == 0 ? true : false;

			var arrayScans = [];
			var s: any = scan;
			s.scans.forEach(tome => {
				if (!tome.chapters && !tome.flag) {
					arrayScans.push({nb:"Tome "+tome.nb, tome:tome.nb, nom:tome.nom, date:tome.date, isDL:false});
				} else {
					tome.chapters.forEach(chapter => {
						if (!chapter.flag)
						arrayScans.push({nb:"Chapitre "+chapter.nb, tome:tome.nb, chapter:chapter.nb, nom:chapter.nomChap, date:chapter.date, isDL:false});
					});
				}
			});

			this.manga.data[dataKey].scan = arrayScans.reverse();
		});
	}

	format() {

		var datas = [];

		for (var key in this.manga.data) {
			var last = this.manga.data[key].last;
			var keyDatas = null;
			switch (key) {
				case 'japscan':
					if (last.indexOf("Scan") == 0) {
						last = last.replace("Scan ", "").substring(this.manga.Nom.length).replace("VF", "");
					}
					last = last.replace("One Shot ", "").replace("Webtoon ", "");
					keyDatas = { domain: 'Japscan', langue: "fr" };
					break;
				default:
					break;
			}
			this.manga.data[key].last = last;
			datas.push({ site: keyDatas, data: this.manga.data[key] });
		}
		this.manga.data = datas;
	}

	downloadAllMangaActive() {
		this.downloadService.addToDownload(this.manga.data[this.activeTab].scan, this.manga._id, this.manga.data[this.activeTab].data.scanId).subscribe(res => {
			this.downloadService.addToDownloadList(res);
		});
	}

	downloadSelectionActive() {
		this.downloadService.addToDownload(this.manga.data[this.activeTab].scan, this.manga._id, this.manga.data[this.activeTab].data.scanId, true).subscribe(res => {
			this.downloadService.addToDownloadList(res);
		});
	}

	setActiveTab(id) {
		this.activeTab = id;
	}

	allCheck() {
		this.isAllCheck = !this.isAllCheck;
		this.manga.data[this.activeTab].scan.forEach(scan => {
			scan.isDL = this.isAllCheck;
		});
	}

	returnToLast() {
		this._location.back();
	}

	addFavorite() {
		this.isFavorite = true;
	}

	removeFavorite() {
		this.isFavorite = false;
	}
}
