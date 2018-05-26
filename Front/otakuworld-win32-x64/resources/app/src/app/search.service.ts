import { Injectable } from '@angular/core';

@Injectable()
export class SearchService {

  private searchStr = "";

  constructor() { }

  public setSearch(search) {
    this.searchStr = search;
  }

  public getSearch() {
    return this.searchStr;
  }
}
