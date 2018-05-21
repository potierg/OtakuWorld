import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllMangasComponent } from './all-mangas.component';

describe('AllMangasComponent', () => {
  let component: AllMangasComponent;
  let fixture: ComponentFixture<AllMangasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllMangasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllMangasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
