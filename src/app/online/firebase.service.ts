import {Injectable} from '@angular/core';
import {FirebaseApp, initializeApp} from 'firebase/app';
import {Auth, getAuth, onAuthStateChanged, signInAnonymously, User} from 'firebase/auth';
import {Firestore, initializeFirestore} from 'firebase/firestore';
import {environment} from '../../environments/environment';

/**
 * Thin wrapper around the modular Firebase SDK: initializes the app, a Firestore instance
 * configured to ignore undefined properties (game state legitimately has optional fields such as
 * `currentPlayer` before a round starts), and anonymous authentication used to identify players.
 */
@Injectable()
export class FirebaseService {

  readonly app: FirebaseApp;
  readonly firestore: Firestore;
  readonly auth: Auth;

  private signInPromise?: Promise<string>;

  constructor() {
    this.app = initializeApp(environment.firebase);
    this.firestore = initializeFirestore(this.app, {ignoreUndefinedProperties: true});
    this.auth = getAuth(this.app);
  }

  get uid(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }

  /** Resolves with the current user's uid, signing in anonymously the first time it's needed. */
  ensureSignedIn(): Promise<string> {
    if (this.auth.currentUser) {
      return Promise.resolve(this.auth.currentUser.uid);
    }
    if (!this.signInPromise) {
      this.signInPromise = new Promise<string>((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(this.auth, (user: User | null) => {
          if (user) {
            unsubscribe();
            resolve(user.uid);
          }
        }, error => {
          unsubscribe();
          this.signInPromise = undefined;
          reject(error);
        });
        signInAnonymously(this.auth).catch(error => {
          unsubscribe();
          this.signInPromise = undefined;
          reject(error);
        });
      });
    }
    return this.signInPromise;
  }
}
