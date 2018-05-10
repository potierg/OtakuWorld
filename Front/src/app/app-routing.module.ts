import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AllMangasComponent } from './all-mangas/all-mangas.component';
import { DetailMangaComponent } from './detail-manga/detail-manga.component';
import { DownloadComponent } from './download/download.component';

const routes: Routes = [
	{
		path: 'home', component: HomeComponent,
		children: [
			{path: "", component: AllMangasComponent},
			{path: "detail/:id", component: DetailMangaComponent},
			{path: "download", component: DownloadComponent}
		]
	}
];

@NgModule({
	imports: [
		CommonModule,
		RouterModule.forRoot(routes)
	],
	declarations: [],
	exports: [RouterModule]
})
export class AppRoutingModule { }
