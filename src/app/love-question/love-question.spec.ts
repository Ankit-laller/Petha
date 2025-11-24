import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoveQuestion } from './love-question';

describe('LoveQuestion', () => {
  let component: LoveQuestion;
  let fixture: ComponentFixture<LoveQuestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoveQuestion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoveQuestion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
