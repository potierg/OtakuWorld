import { Component, OnInit } from '@angular/core';
import { MangasService } from '../mangas.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  private printMangas: any = [];
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
    this.mangasService.getAll(this.currentPage, 24).subscribe(mangas => {
      this.onLoad = false;
      this.printMangas = mangas;
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
}
