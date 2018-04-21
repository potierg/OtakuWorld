import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ScanService } from '../scan.service';

@Component({
  selector: 'app-scan-view',
  templateUrl: './scan-view.component.html',
  styleUrls: ['./scan-view.component.css']
})
export class ScanViewComponent implements OnInit {

  @Input() scanId: string;
  @Input() scanObj: any;
  @Output()
  returnMangaList: EventEmitter<string> = new EventEmitter<string>();

  onLoad: boolean = true;
  scans = null;
  listPages = [];
  currentPage = 0;
  currentPicture = null;

  constructor(private scanService: ScanService) { }

  ngOnInit() {
    this.onLoad = true;
    
    this.scanService.getListScanByIdAndChapter(this.scanId, this.scanObj.tome, this.scanObj.chapter).subscribe(response => {
      this.scans = response;
      this.scans = this.scans.scans;
      for (var key in this.scans.pages) {
        this.scans.pages[key] = this.scans.link + this.scans.pages[key];
      }
      this.loadImg();
      console.log(this.scans, this.onLoad);
    });
  }

  createImageFromBlob(image: Blob) {
    let reader = new FileReader();
    reader.addEventListener("load", () => {
       this.currentPicture = reader.result;
    }, false);

    if (image) {
       reader.readAsDataURL(image);
    }
}
  loadImg() {
    this.onLoad = true;
    this.scanService.getImgWithLink(this.scans.pages[this.currentPage]).subscribe(data => {
      this.createImageFromBlob(data);
      this.onLoad = false;
    }, error => {
      this.onLoad = false;
    });
  }

  back() {
    this.returnMangaList.emit("");
  }

}
