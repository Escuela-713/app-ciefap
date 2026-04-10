import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Developers } from './developers';

describe('Developers', () => {
  let component: Developers;
  let fixture: ComponentFixture<Developers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Developers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Developers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
