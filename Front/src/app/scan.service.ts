import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ScanService {

  constructor(private http: HttpClient) { }
  
  getById(id) {
    return this.http.get('http://127.0.0.1:8080/manga/chapters/'+id);
  }

  getListScanByIdAndChapter(id, tome, chapitre) {
    var url = "";
    
    if (chapitre)
      url = "http://127.0.0.1:8080/manga/"+id+"/chapters/"+tome+"/"+chapitre+"/scans";
    else
      url = "http://127.0.0.1:8080/manga/"+id+"/chapters/"+tome+"/0/scans";

    return this.http.get(url);
  }
}
