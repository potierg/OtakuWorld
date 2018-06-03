import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'
import { UserService } from '../user.service';

const PORT = '4521';

@Component({
	selector: 'app-explorer',
	templateUrl: './explorer.component.html',
	styleUrls: ['./explorer.component.css']
})
export class ExplorerComponent implements OnInit {

    private currentPath = null;
    private folders = [];

    constructor(private http: HttpClient, private user: UserService) { }

	ngOnInit() {
        this.currentPath = this.user.getPath();
        this.getFolders();
    }
    
    getFolders() {
        this.folders = [];
        var data = this.currentPath ? {path: this.currentPath} : {};

        this.http.post('http://127.0.0.1:' + PORT + '/files', data).subscribe((response :any) => {
            this.user.setPath(response.path);
            this.currentPath = response.path;
            this.folders = response.folders;
        });
    }

    changeFolder(folder) {
        this.currentPath = folder.path;
        this.getFolders();
    }
}
