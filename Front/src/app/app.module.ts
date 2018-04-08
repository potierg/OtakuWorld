import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './/app-routing.module';
import { HttpClientModule } from '@angular/common/http';

import { HomeComponent } from './home/home.component';
import { MangasService } from './mangas.service';
import { MangaListComponent } from './manga-list/manga-list.component';

import {MatInputModule} from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import {NgxPaginationModule} from 'ngx-pagination';
import { MangaDetailComponent } from './manga-detail/manga-detail.component';
import { ScanListComponent } from './scan-list/scan-list.component';
import { ScanService } from './scan.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MangaListComponent,
    MangaDetailComponent,
    ScanListComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatInputModule,
    FormsModule,
    NgbModule.forRoot()
  ],
  providers: [MangasService, ScanService],
  bootstrap: [AppComponent]
})
export class AppModule { }
