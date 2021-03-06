import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/map';
import "rxjs/Rx";
import { UserService } from './user.service';
import { SearchService } from './search.service';
import { environment } from '../environments/environment'

@Injectable()
export class MangasService {
	private mangasList = [];
	private loadDone = false;
	public lastPageLoad = 0;
	public total = 0;
	public limit = 100;

	constructor(private http: HttpClient,
		private userService: UserService,
		private searchService: SearchService) {}

	getListMangas() {
		var search = this.searchService.getSearch();
		if (search == "") {
			return this.mangasList;			
		}
		var newList = this.mangasList.filter((manga) => {
			if (manga.Nom.toLowerCase().indexOf(search.toLowerCase()) !== -1)
				return true;
			return false;
		});

		return newList;
	}

	getLastPage() {
		return this.lastPageLoad;
	}

	setLastPage(page) {
		this.lastPageLoad = page;
	}
	
	getAll(page, userId) {
		return this.http.get(environment.serverIp + 'mangas/' + this.limit + '/' + page + '?userId=' + userId);
	}

	getWithSearch(search, count, page) {
		return this.http.get(environment.serverIp + 'manga/search/' + search + '/' + count + '/' + page);
	}

	getMangaById(id, userId) {
		return this.http.get(environment.serverIp + 'manga/' + id + '?userId=' + userId);
	}

	end() {
		this.loadDone = true;
	}

	isEnd() {
		return this.loadDone;
	}

	saveInMangaslist(manga) {
		this.mangasList = this.mangasList.concat(manga);
	}

	isListLoad() {
		if (this.mangasList.length == 0)
			return false;
		return true;
	}

	getByPage(page) {
		if (page == this.lastPageLoad)
			return this.mangasList.slice((page - 1) * this.limit);
		return this.mangasList.slice((page - 1) * this.limit, ((page) * this.limit) - 1);
	}

	setFavorite(mangaId, val) {
		for (var k in this.mangasList) {
			if (this.mangasList[k]._id == mangaId) {
				this.mangasList[k].isFavorite = val;
			}
		}
	}

	favorite(mangaId, userId) {
		return this.http.get(environment.serverIp + 'favorite/' + userId + '/' + mangaId);
	}

	getByListIds(listIds) {
		
	}
}
