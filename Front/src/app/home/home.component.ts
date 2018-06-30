import { Component, OnInit } from '@angular/core';
import { MangasService } from '../mangas.service';
import { DownloadService } from '../download.service';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { SearchService } from '../search.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

	private searchStr = '';
	private showMenu = true;
	private route  = "";

	constructor(private mangasService: MangasService,
		private downloadService: DownloadService,
		private userService: UserService,
		private searchService: SearchService,
		private router: Router) {
	}

	ngOnInit() {
		var th = this;
		this.userService.loadUser(() => {
			if (!th.downloadService.isListLoad()) {
				this.downloadService.loadDownloadsByUserId().subscribe(function (list) {
					th.downloadService.setList(list);
	
					th.loadAllMangas(1);
				});
			};	
		});
		this.downloadService.processLoop();
	}

	public loadAllMangas(page) {
		if (this.mangasService.total > 0 && page > (this.mangasService.total / this.mangasService.limit) + 1) {
			this.mangasService.end();
			return ;
		}
		this.mangasService.getAll(page, this.userService.getUserId()).subscribe(datas => {
			this.mangasService.setLastPage(page);
			if (this.mangasService.total == 0)
				this.mangasService.total = datas['total'];
			this.mangasService.saveInMangaslist(datas['mangas']);

			setTimeout( () => {
				//this.loadAllMangas(page + 1);
			 }, 500 );
		});
	}

	searchChange() {
		this.searchService.setSearch(this.searchStr);
	}

	logout() {
		this.userService.logOut();
		window.location.href = '/';
	}
}
