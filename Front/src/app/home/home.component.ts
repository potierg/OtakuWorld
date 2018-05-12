import { Component, OnInit } from '@angular/core';
import { MangasService } from '../mangas.service';
import { DownloadService } from '../download.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

	private searchStr = '';
	private showMenu = true;

	constructor(private mangasService: MangasService, private downloadService: DownloadService) {
	}

	ngOnInit() {
		var th = this;
		if (!th.downloadService.isListLoad()) {
			this.downloadService.loadDownloadsByUserId().subscribe(function (list) {
				th.downloadService.setList(list);

				th.loadAllMangas(1);
			});
		}
	}

	public loadAllMangas(page) {
		if (this.mangasService.total > 0 && page > (this.mangasService.total / this.mangasService.limit) + 1) {
			this.mangasService.end();
			return ;
		}
		this.mangasService.getAll(page).subscribe(datas => {
			this.mangasService.setLastPage(page);
			if (this.mangasService.total == 0)
				this.mangasService.total = datas['total'];
			this.mangasService.saveInMangaslist(datas['mangas']);

			setTimeout( () => {
				this.loadAllMangas(page + 1);
			 }, 500 );
		});
	}

}
