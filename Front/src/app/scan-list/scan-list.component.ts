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

  private scan : any;
  private onLoad = false;

  constructor(private scanService: ScanService) { }

  ngOnInit() {
    this.onLoad = true;
    this.scanService.getById(this.scanId).subscribe(scans => {
      this.onLoad = false;
      this.scan = scans;
      console.log(scans);
    })
  }

}
