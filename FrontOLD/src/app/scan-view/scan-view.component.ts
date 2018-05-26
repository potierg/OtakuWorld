import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ScanService } from '../scan.service';
import { DomSanitizer } from '@angular/platform-browser';

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

	constructor(private scanService: ScanService, private sanitizer: DomSanitizer) { }

	ngOnInit() {
		this.onLoad = true;

		this.scanService.getListScanByIdAndChapter(this.scanId, this.scanObj.tome, this.scanObj.chapter).subscribe(response => {
			this.scans = response;
			this.scans = this.scans.scans;
			for (var key in this.scans.pages) {
				this.scans.pages[key] = this.scans.link + this.scans.pages[key];
			}
			this.loadImg();
			//console.log(this.scans, this.onLoad);
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
		console.log(this.scans.pages[this.currentPage]);

		/*var xhr = new XMLHttpRequest();
		var th = this;

		xhr.open( "GET", this.scans.pages[this.currentPage], true );
		xhr.responseType = "arraybuffer";
		
		xhr.onload = function( e ) {
			var arrayBufferView = new Uint8Array( this.response );
			var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
			console.log(blob);
			var urlCreator = window.URL;
			var imageUrl = urlCreator.createObjectURL( blob );
			th.currentPicture = imageUrl;
			th.onLoad = false;
		};
		
		xhr.send();*/
		


		return ;
		/*this.scanService.getImgWithLink(this.scans.pages[this.currentPage]).subscribe(data => {
			console.log("POST");
			console.log(data);

			let urlCreator = window.URL;
			this.currentPicture = this.sanitizer.bypassSecurityTrustUrl(
				urlCreator.createObjectURL(data)
			);

			this.onLoad = false;
		}, error => {
			console.log("ERROR");
			this.onLoad = false;
		});*/
	}

	back() {
		this.returnMangaList.emit("");
	}

}
