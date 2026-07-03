import { TestBed } from '@angular/core/testing';

import { Parqueo } from './parqueo';

describe('Parqueo', () => {
  let service: Parqueo;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Parqueo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
