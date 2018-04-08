import { Component, OnInit } from '@angular/core';
import { MangasService } from '../mangas.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  private currentMangaId = "5ab63b6c624f4e420cdb0b46";
  private currentScanId = "";
  private printMangas: any = [];
  private totalMangas: Number;
  private searchStr = '';
  private currentPage = 1;
  private onLoad = false;
  private limit = 50;
  private showMenu = true;

  constructor(private mangasService : MangasService) {
    console.log("INIT");
  }

  ngOnInit() {
    this.refreshMangas();
  }

  public refreshMangas() {
    this.onLoad = true;
    if (this.searchStr == '') {
      this.mangasService.getAll(this.currentPage, this.limit).subscribe(datas => {
        this.onLoad = false;
        this.printMangas = datas['manga'];
        this.totalMangas = datas['total'];
      });  
    }
    else {
      this.mangasService.getWithSearch(this.searchStr.toLowerCase(), this.currentPage, this.limit).subscribe(datas => {
        this.onLoad = false;
        this.printMangas = datas['manga'];
        this.totalMangas = datas['total'];
      });  
    }
  }

  public viewManga(id) {
    this.currentMangaId = id;
  }

  public viewChapterList(id) {
    this.currentScanId = id;
  }

  setPage(event): void {
    this.currentPage = event;
    this.refreshMangas();
  }
}
