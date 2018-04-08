import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ScanService {

  constructor(private http: HttpClient) { }
  
  getById(id) {
    return this.http.get('http://127.0.0.1:8080/manga/chapters/'+id);
  }

}
