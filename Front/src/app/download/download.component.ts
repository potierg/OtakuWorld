import { Component, OnInit } from '@angular/core';
import { DownloadService } from '../download.service';

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.css']
})
export class DownloadComponent implements OnInit {

  private downloadList = null;
  private currentDl = {chap:'', percent:0};

  constructor(private downloadService: DownloadService) { }

  ngOnInit() {
    this.downloadList = this.downloadService.getDownloadList();
    var index = 0;
    this.downloadList.forEach(download => {
      download.isRun = false;
      index++;
    });

    console.log(this.downloadList);
  }

  startDownload() {
    for (var keyDl in this.downloadList) {
      var listPages = [];

      console.log(this.downloadList[keyDl]);
      return ;

    }
  }

  stopDownload(index) {
    this.downloadList[index].isRun = false;
  }
}
