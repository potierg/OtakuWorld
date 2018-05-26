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
import { InfiniteScrollModule } from "ngx-infinite-scroll";

import {NgxPaginationModule} from 'ngx-pagination';
import { MangaDetailComponent } from './manga-detail/manga-detail.component';
import { ScanListComponent } from './scan-list/scan-list.component';
import { ScanService } from './scan.service';
import { ScanViewComponent } from './scan-view/scan-view.component';
import { AllMangasComponent } from './all-mangas/all-mangas.component';
import { DetailMangaComponent } from './detail-manga/detail-manga.component';
import { DownloadComponent } from './download/download.component';
import { DownloadService } from './download.service';
import { UserService } from './user.service';
import { FavoriteComponent } from './favorite/favorite.component';
import { LoginComponent } from './login/login.component';
import { SigninComponent } from './signin/signin.component';
import { SearchService } from './search.service';

import { NgProgressModule } from 'ngx-progressbar';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MangaListComponent,
    MangaDetailComponent,
    ScanListComponent,
    ScanViewComponent,
    AllMangasComponent,
    DetailMangaComponent,
    DownloadComponent,
    FavoriteComponent,
    LoginComponent,
    SigninComponent,
  ],
  imports: [
    InfiniteScrollModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatInputModule,
    FormsModule,
    NgbModule.forRoot(),
    NgProgressModule
  ],
  providers: [MangasService, ScanService, DownloadService, UserService, SearchService],
  bootstrap: [AppComponent]
})
export class AppModule { }
