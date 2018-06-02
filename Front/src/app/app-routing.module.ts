import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AllMangasComponent } from './all-mangas/all-mangas.component';
import { DetailMangaComponent } from './detail-manga/detail-manga.component';
import { DownloadComponent } from './download/download.component';
import { FavoriteComponent } from './favorite/favorite.component';
import { LoginComponent } from './login/login.component';
import { SigninComponent } from './signin/signin.component';
import { ParametersComponent } from './parameters/parameters.component';

const routes: Routes = [
	{
		path: '', component: HomeComponent,
		children: [
			{path: "", component: AllMangasComponent},
			{path: "detail/:id", component: DetailMangaComponent},
			{path: "download", component: DownloadComponent},
			{path: "favorite", component: FavoriteComponent},
			{path: "login", component: LoginComponent},
			{path: "signin", component: SigninComponent},
			{path: "params", component: ParametersComponent}
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
