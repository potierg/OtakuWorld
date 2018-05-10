import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailMangaComponent } from './detail-manga.component';

describe('DetailMangaComponent', () => {
  let component: DetailMangaComponent;
  let fixture: ComponentFixture<DetailMangaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailMangaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailMangaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
