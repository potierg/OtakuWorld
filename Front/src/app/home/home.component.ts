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
  private searchStr = '';
  private currentPage = 1;
  private onLoad = false;
  private limit = 25;

  constructor(private mangasService : MangasService) {
    console.log("INIT");
  }

  ngOnInit() {
    this.refreshMangas();
  }

  public refreshMangas() {
    this.onLoad = true;
    if (this.searchStr == '') {
      this.mangasService.getAll(this.currentPage, 24).subscribe(datas => {
        this.onLoad = false;
        this.printMangas = datas['manga'];
        this.totalMangas = datas['total'];
      });  
    }
    else {
      this.mangasService.getWithSearch(this.searchStr, this.currentPage, 24).subscribe(datas => {
        this.onLoad = false;
        this.printMangas = datas['manga'];
        this.totalMangas = datas['total'];
      });  
    }
  }

  public execSearch() {
  }

  goToPage(n: number): void {
    this.currentPage = n;
    this.refreshMangas();
  }

  onNext(): void {
    this.currentPage++;
    this.refreshMangas();
  }

  onPrev(): void {
    this.currentPage--;
    this.refreshMangas();
  }
}
