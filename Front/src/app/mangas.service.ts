import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/map';
import "rxjs/Rx";

const userID = "5af746ad4914c73020c5bfbe";

@Injectable()
export class MangasService {
	private mangasList = [];
	private loadDone = false;
	public lastPageLoad = 0;
	public total = 0;
	public limit = 100;

	constructor(private http: HttpClient) { }

	getLastPage() {
		return this.lastPageLoad;
	}

	setLastPage(page) {
		this.lastPageLoad = page;
	}
	
	getAll(page) {
		return this.http.get('http://127.0.0.1:8080/mangas/' + this.limit + '/' + page + '?userId=' + userID);
	}

	getWithSearch(search, count, page) {
		return this.http.get('http://127.0.0.1:8080/manga/search/' + search + '/' + count + '/' + page);
	}

	getMangaById(id) {
		return this.http.get('http://127.0.0.1:8080/manga/' + id + '?userId=' + userID);
	}

	getMangasList() {
		return this.mangasList;
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

	favorite(mangaId) {
		return this.http.get('http://127.0.0.1:8080/favorite/' + userID + '/' + mangaId);
	}

	getByListIds(listIds) {
		
	}
}
