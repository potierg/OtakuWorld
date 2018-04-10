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
          this.scans.push({nom:'Tome '+tome.numero+(tome.nomTome ? ' : '+tome.nomTome:''), pages:tome.pages, select:false});
        } else {
          var chapters = tome.chapters.reverse();
          var chapArray = [];
          for (var chapKey in tome.chapters) {
            var chapter = tome.chapters[chapKey];
            chapArray.push({nom:'Chapitre '+chapter.numero+(chapter.nomChap ? ' : '+chapter.nomChap:''),
            pages:chapter.pages, select:false})
          }
          this.scans.push({nom:'Tome '+tome.numero+(tome.nomTome ? ' : '+tome.nomTome:''), chapters:chapArray, show: false, select:false});
        }
      }
      this.scans = this.scans.reverse();
      console.log(this.scans);
    });
  }

  showChapters(scan) {
    console.log(scan);
    if (scan.show != undefined)
      scan.show = !scan.show;
  }
}
