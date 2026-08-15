// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import {Environment} from './environment.model';

export const environment: Environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyCLes6l_aru8Fw8EitKWVsGsrub6xDS5Ew',
    authDomain: 'play-yaniv.firebaseapp.com',
    projectId: 'play-yaniv',
    storageBucket: 'play-yaniv.firebasestorage.app',
    messagingSenderId: '527817103468',
    appId: '1:527817103468:web:773fef3ee39dd3b11ba049',
    measurementId: 'G-8LW2TLR0MP'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
