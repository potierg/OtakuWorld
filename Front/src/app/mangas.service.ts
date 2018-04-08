import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from "rxjs/Observable";
import 'rxjs/add/operator/map';
import "rxjs/Rx";

@Injectable()
export class MangasService {

  constructor(private http: HttpClient) { }

  getAll(page, count) {
    return this.http.get('http://127.0.0.1:8080/mangas/'+count+'/'+page);
  }

  getWithSearch(search, count, page) {
    return this.http.get('http://127.0.0.1:8080/manga/search/'+search+'/'+count+'/'+page);
  }

  getMangaById(id) {
    return this.http.get('http://127.0.0.1:8080/manga/'+id);
  }
}
