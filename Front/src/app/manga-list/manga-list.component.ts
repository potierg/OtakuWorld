import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-manga-list',
  templateUrl: './manga-list.component.html',
  styleUrls: ['./manga-list.component.css']
})
export class MangaListComponent implements OnInit {

  @Input() listMangaPrint: any;

  constructor() { }

  ngOnInit() {
  }
}
