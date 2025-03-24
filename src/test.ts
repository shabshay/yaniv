import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// First, initialize the Angular testing environment if it hasn't been initialized already.
if (!getTestBed().platform) {
  getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting(), {
      teardown: { destroyAfterEach: false }
    }
  );
}

describe('Sample Test Suite', () => {
  it('should pass this sample test', () => {
    expect(true).toBe(true);
  });
});
