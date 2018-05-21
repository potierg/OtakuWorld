import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-manga-list',
  templateUrl: './manga-list.component.html',
  styleUrls: ['./manga-list.component.css']
})
export class MangaListComponent implements OnInit {

  @Input() listMangaPrint: any;
  @Output()
  change: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  getLastChapString(manga) {
    var last = manga.data.japscan.last;
    if (last.indexOf("Scan") == 0) {
      last = last.replace("Scan ", "").substring(manga.Nom.length).replace("VF", "");
    }
    last = last.replace("One Shot ", "").replace("Webtoon ", "");
    return last;
  }

  viewManga(id: string) {
    this.change.emit(id); 
  }
}
