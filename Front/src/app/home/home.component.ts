import { Component, OnInit } from '@angular/core';
import { MangasService } from '../mangas.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  private printMangas: any = [];
  private totalMangas: Number;
  private currentPage = 1;
  private onLoad = false;

  constructor(private mangasService : MangasService) {
    console.log("INIT");
  }

  ngOnInit() {
    this.refreshMangas();
  }

  public refreshMangas() {
    this.onLoad = true;
    this.mangasService.getAll(this.currentPage, 24).subscribe(datas => {
      this.onLoad = false;
      this.printMangas = datas['manga'];
      this.totalMangas = datas['total'];
    });
  }

  public previewPage() {
    this.currentPage--
    this.refreshMangas();
  }

  public nextPage() {
    this.currentPage++
    this.refreshMangas();
  }

  public getPageData() {
    console.log("event");
    /*this.page = event.page;
    this.itemsPerPage = event.itemsPerPage
    this.loadStudentsByPage(this.page, this.itemsPerPage);*/
  };
}
