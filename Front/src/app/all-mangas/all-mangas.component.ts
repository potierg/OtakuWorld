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
		this.mangasList = [];
		if (!this.mangasService.isListLoad()) {
			this.loadAllMangas(1);
		} else {
			this.totalMangas = this.mangasService.getMangasList().length;
			this.reloadMangas(1);
		}
	}

	public loadAllMangas(page) {
		if (this.mangasList.length > 1 && page > (this.totalMangas / this.limit) + 1) {
			this.mangasService.setEnd();
			return ;
		}
		this.mangasService.getAll(page, this.limit).subscribe(datas => {
			this.isLoad = true;

			this.mangasService.setLastPage(page);
			this.mangasList = this.mangasList.concat(datas['mangas']);
			this.mangasService.savemangasList(this.mangasList);
			this.totalMangas = datas['total'];

			setTimeout( () => {
				this.loadAllMangas(page + 1);
			 }, 500 );
		});
	}

	public reloadMangas(page) {
		if (page > this.mangasService.getLastPage() && this.mangasService.isEnd())
				return ;

		this.mangasList = this.mangasList.concat(this.mangasService.reloadAll(page, this.limit));
		this.isLoad = true;

		var timesleep = 500;
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
