import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MangasService } from '../mangas.service';

@Component({
  selector: 'app-manga-detail',
  templateUrl: './manga-detail.component.html',
  styleUrls: ['./manga-detail.component.css']
})
export class MangaDetailComponent implements OnInit {

  @Input() mangaId: string;
  @Output()
  returnManga: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  viewChapterList: EventEmitter<string> = new EventEmitter<string>();


  private manga: any;
  private onLoad = false;
  
  constructor(private mangasService : MangasService) { }

  ngOnInit() {
    this.onLoad = true;
    this.mangasService.getMangaById(this.mangaId).subscribe(manga => {
      this.manga = manga;
      this.format();
      this.onLoad = false;
    });
  }

  format() {
    
    var datas = [];

    for (var key in this.manga.data) {
      var last = this.manga.data[key].last;
      var keyDatas = null;
      switch (key) {
        case 'japscan':
          if (last.indexOf("Scan") == 0) {
            last = last.replace("Scan ", "").substring(this.manga.Nom.length).replace("VF", "");
          }
          last = last.replace("One Shot ", "").replace("Webtoon ", "");
          keyDatas = {domain:'Japscan',langue:"fr"};
          break;
        default:
          console.log(key);
          break;
      }
      this.manga.data[key].last = last;
      datas.push({site:keyDatas,data:this.manga.data[key]});
    }
    this.manga.data = datas;
    console.log(this.manga);
  }

  back() {
    this.returnManga.emit('');
  }

  viewChapters(id) {
    this.viewChapterList.emit(id);
  }
}
