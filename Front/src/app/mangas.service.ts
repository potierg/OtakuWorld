import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/map';
import "rxjs/Rx";

@Injectable()
export class MangasService {
	private mangasList = [];
	private endLoad = false;
	private lastPageLoad = 0;

	constructor(private http: HttpClient) { }

	getLastPage() {
		return this.lastPageLoad;
	}

	setLastPage(page) {
		this.lastPageLoad = page;
	}
	
	getAll(page, count) {
		return this.http.get('http://127.0.0.1:8080/mangas/' + count + '/' + page);
	}

	getWithSearch(search, count, page) {
		return this.http.get('http://127.0.0.1:8080/manga/search/' + search + '/' + count + '/' + page);
	}

	getMangaById(id) {
		return this.http.get('http://127.0.0.1:8080/manga/' + id);
	}

	getMangasList() {
		return this.mangasList;
	}

	setEnd() {
		this.endLoad = true;
	}

	isEnd() {
		return this.endLoad;
	}

	savemangasList(l) {
		this.mangasList = l;
	}

	isListLoad() {
		if (this.mangasList.length == 0)
			return false;
		return true;
	}

	reloadAll(page, count) {
		if (page == this.lastPageLoad)
			return this.mangasList.slice((page - 1) * count);
		return this.mangasList.slice((page - 1) * count, ((page) * count) - 1);
	}
}
