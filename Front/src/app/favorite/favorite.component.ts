import { Component, OnInit } from '@angular/core';
import { MangasService } from '../mangas.service';
import { UserService } from '../user.service';

@Component({
	selector: 'app-favorite',
	templateUrl: './favorite.component.html',
	styleUrls: ['./favorite.component.css']
})
export class FavoriteComponent implements OnInit {

	private isLoad = false;
	private listManga = [];
	
	constructor(private mangaService: MangasService,
		private userService: UserService) { }

	ngOnInit() {
		this.loadFavoriteList();
	}

	loadFavoriteList() {
		if (!this.userService.isUserLoad()) {
			return setTimeout( () => {
				this.loadFavoriteList();
			}, 500);	
		}

		this.listManga = this.userService.getUser().favorite;
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
}
