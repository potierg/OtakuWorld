import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ScanService } from '../scan.service';
import { scan } from 'rxjs/operators/scan';

@Component({
  selector: 'app-scan-list',
  templateUrl: './scan-list.component.html',
  styleUrls: ['./scan-list.component.css']
})
export class ScanListComponent implements OnInit {

  @Input() scanId: string;
  @Output()
  returnMangaDetail: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  viewScan: EventEmitter<Object> = new EventEmitter<Object>();

  private scans : any;
  private onLoad = false;

  constructor(private scanService: ScanService) { }

  ngOnInit() {
    this.onLoad = true;
    this.scanService.getById(this.scanId).subscribe(scans => {
      this.onLoad = false;

      this.scans = [];

      for (var tomeKey in scans['scans']) {
        var tome = scans['scans'][tomeKey];
        if (!tome.chapters) {
          this.scans.push({nom:'Tome '+tome.nb+(tome.nom ? ' : '+tome.nom:''), nb:tome.nb, select:false});
        } else {
          var chapters = tome.chapters;
          var chapArray = [];
          for (var chapKey in tome.chapters) {
            var chapter = tome.chapters[chapKey];
            chapArray.push({nom:'Chapitre '+chapter.nb+(chapter.nomChap ? ' : '+chapter.nomChap:''),
            nb:chapter.nb, select:false})
          }
          this.scans.push({nom:'Tome '+tome.nb+(tome.nom ? ' : '+tome.nom:''), chapters:chapArray, nb:tome.nb, show: false, select:false});
        }
      }
      this.scans = this.scans;
    });
  }

  showChapters(scan) {
    if (scan.show != undefined)
      scan.show = !scan.show;
  }

  back() {
    this.returnMangaDetail.emit('');
  }

  viewTome(tome) {
    this.viewScan.emit({tome:tome, chapter:null});
  }

  viewChapter(tome, chapter) {
    this.viewScan.emit({tome:tome, chapter:chapter});
  }
}
