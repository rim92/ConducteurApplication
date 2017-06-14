import { Injectable } from '@angular/core';

import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';


@Injectable()
export class LoginProvider {

  HAS_LOGGED_IN = 'hasLoggedIn';
  HAS_SEEN_TUTORIAL = 'hasSeenTutorial';

  constructor(
    public events: Events,
    public storage: Storage
  ) {}



  login(idUser: string): void {
    this.storage.set(this.HAS_LOGGED_IN, true);
    this.setUsername(idUser);
    this.events.publish('user:login');
  };



  logout(): void {
    this.storage.remove(this.HAS_LOGGED_IN);
    this.storage.remove('idUser');
    this.events.publish('user:logout');
  };

  setUsername(idUser: string): void {
    this.storage.set('idUser', idUser);
  };

  getUsername(): Promise<string> {
    return this.storage.get('idUser').then((value) => {
      return value;
    });
  };

  hasLoggedIn(): Promise<boolean> {
    return this.storage.get(this.HAS_LOGGED_IN).then((value) => {
      return value === true;
    });
  };


}
