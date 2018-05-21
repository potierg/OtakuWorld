import { Component, OnInit } from '@angular/core';
import { MangasService } from '../mangas.service';
import { Router } from '@angular/router';
import { HostListener } from '@angular/core';
import { UserService } from '../user.service';
import { SearchService } from '../search.service';

@Component({
	selector: 'app-all-mangas',
	templateUrl: './all-mangas.component.html',
	styleUrls: ['./all-mangas.component.css']
})

export class AllMangasComponent implements OnInit {
	private limit = 100;
	private isLoad: Boolean = false;

	private totalMangas = 0;
	private currentPage = 1;

	constructor(private mangasService: MangasService,
				private userService: UserService,
				private searchService: SearchService,
				private router: Router) {
		
	}

	ngOnInit() {
		//this.reloadMangas(1);
		this.isLoad = true;
	}

	public getLastChapString(manga) {
		var last = manga.data.japscan.last;
		if (last.indexOf("Scan") == 0) {
			last = last.replace("Scan ", "").substring(manga.Nom.length).replace("VF", "");
		}
		last = last.replace("One Shot ", "").replace("Webtoon ", "");
		return last;
	}

	addFavorite(index) {
		this.mangasService.getListMangas()[index].isFavorite = true;
		this.mangasService.favorite(this.mangasService.getListMangas()[index]._id, this.userService.getUserId()).subscribe(() => {
			this.userService.loadUser(() => {});
		});
	}

	removeFavorite(index) {
		this.mangasService.getListMangas()[index].isFavorite = false;
		this.mangasService.favorite(this.mangasService.getListMangas()[index]._id, this.userService.getUserId()).subscribe(() => {
			this.userService.loadUser(() => {});
		});
	}
}
