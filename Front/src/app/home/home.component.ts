import { Component, OnInit } from '@angular/core';
import { MangasService } from '../mangas.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  private printMangas: any = [];

  constructor(private mangasService : MangasService) {
    console.log("INIT");
  }

  ngOnInit() {
    this.mangasService.getAll(1, 25).subscribe(mangas => {
      this.printMangas = mangas;
    });
  }
}
