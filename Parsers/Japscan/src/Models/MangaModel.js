'use strict';

module.exports = class MangaModel {
    constructor() {
        this.Id = 0;
        this.Nom = "";
        this.Genre = [];
        this.NomAlternatif = [];
        this.Synopsis = {};
        this.Statut = '';
        this.SortieInitial = null;
        this.Auteur = [];
        this.Cover = [];
        this.data = {japscan: {}};
    }

    loadFromDB(manga) {
        if (manga == null)
            return ;

        this.Id = manga._id;
        this.Nom = manga.Nom;
        this.Genre = manga.Genre;
        this.NomAlternatif = manga['Nom Alternatif'];
        this.Synopsis = manga.Synopsis;
        this.Statut = manga.Statut;
        this.SortieInitial = manga['Sortie Initial'];
        this.Auteur = manga.Auteur;
        this.Cover = manga.Cover;
        this.data = manga.data;
    }

    pushUniqueGenre(NewGenre) {
        if (this.Genre.indexOf(NewGenre) === -1)
            this.Genre.push(NewGenre)
    }

    pushUniqueNomAlternatif(NewNomAlternatif) {
        if (this.NomAlternatif.indexOf(NewNomAlternatif) === -1)
            this.NomAlternatif.push(NewNomAlternatif)
    }

    pushUniqueAuteur(NewAuteur) {
        if (this.Auteur.indexOf(NewAuteur) === -1)
            this.Auteur.push(NewAuteur)
    }

    formatMangaToObject() {        
        return {
            Nom: this.Nom, Genre: this.Genre, 'Nom Alternatif': this.NomAlternatif, Synopsis: this.Synopsis,
            Statut: this.Statut, 'Sortie Initial': this.SortieInitial, Auteur: this.Auteur, Cover: this.Cover,
            data: this.data
        }
    }

    savedInDB(mongo, cb) {
        if (this.Id != 0) {
            mongo.updateManga(this.Id, this.formatMangaToObject(), () => {
                cb();
            });
        }
        else
            mongo.addManga(this.formatMangaToObject(), () => {
                cb();
            });
    }
}