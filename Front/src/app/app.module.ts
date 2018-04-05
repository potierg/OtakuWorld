import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { AppRoutingModule } from './/app-routing.module';
import { HttpClientModule } from '@angular/common/http';

import { HomeComponent } from './home/home.component';
import { MangasService } from './mangas.service';
import { MangaListComponent } from './manga-list/manga-list.component';
import { PaginationModule } from 'ngx-pagination-bootstrap'

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MangaListComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    PaginationModule,
  ],
  providers: [MangasService],
  bootstrap: [AppComponent]
})
export class AppModule { }
