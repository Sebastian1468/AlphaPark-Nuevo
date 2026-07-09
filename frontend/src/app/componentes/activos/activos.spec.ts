import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ActivosComponent } from './activos';

describe('ActivosComponent', () => {
  let component: ActivosComponent;
  let fixture: ComponentFixture<ActivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivosComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
