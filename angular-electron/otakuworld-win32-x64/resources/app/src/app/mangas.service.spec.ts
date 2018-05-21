import { TestBed, inject } from '@angular/core/testing';

import { MangasService } from './mangas.service';

describe('MangasService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MangasService]
    });
  });

  it('should be created', inject([MangasService], (service: MangasService) => {
    expect(service).toBeTruthy();
  }));
});
