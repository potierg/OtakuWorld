import { Component, OnInit } from '@angular/core';
import { MangasService } from '../mangas.service';
import { Router } from '@angular/router';
import { HostListener } from '@angular/core';

@Component({
	selector: 'app-all-mangas',
	templateUrl: './all-mangas.component.html',
	styleUrls: ['./all-mangas.component.css']
})

export class AllMangasComponent implements OnInit {
	private limit = 100;
	private isLoad: Boolean = false;

	private mangasList: any = [];
	private totalMangas = 0;
	private currentPage = 1;

	constructor(private mangasService: MangasService, private router: Router) {
		
	}

	ngOnInit() {
		this.reloadMangas(1);
	}


	public reloadMangas(page) {

		if (this.mangasService.total == 0) {
			return setTimeout( () => {
				this.reloadMangas(page);
			}, 500);
		}
		
		if (page > this.mangasService.getLastPage() && this.mangasService.isEnd())
				return ;

		this.mangasList = this.mangasList.concat(this.mangasService.getByPage(page));

		this.isLoad = true;

		var timesleep = 100;
		if (!this.mangasService.isEnd() && page == this.mangasService.getLastPage())
			timesleep = 2000;

		setTimeout( () => {
			this.reloadMangas(page + 1);
		}, timesleep);
	}

	/*public setPage(event): void {
	  this.currentPage = event;
	  this.loaAllMangas(0);
	}*/

	public viewManga(id) {

	}

	public getLastChapString(manga) {
		var last = manga.data.japscan.last;
		if (last.indexOf("Scan") == 0) {
			last = last.replace("Scan ", "").substring(manga.Nom.length).replace("VF", "");
		}
		last = last.replace("One Shot ", "").replace("Webtoon ", "");
		return last;
	}
}
