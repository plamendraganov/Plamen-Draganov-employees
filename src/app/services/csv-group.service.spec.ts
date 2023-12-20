import { TestBed } from '@angular/core/testing';

import { CsvGroupService } from './csv-group.service';

describe('CsvGroupService', () => {
  let service: CsvGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CsvGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
