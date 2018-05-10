import { Component, OnInit } from '@angular/core';
import { MangasService } from '../mangas.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  private searchStr = '';
  private showMenu = true;

  constructor(private mangasService : MangasService) {
  }

  ngOnInit() {
  }
}
