import { Injectable } from '@angular/core';

import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import {Http} from '@angular/http';

@Injectable()
export class OffreProvider {

  HAS_LOGGED_IN = 'hasLoggedIn';
  HAS_SEEN_TUTORIAL = 'hasSeenTutorial';

  constructor(
    public events: Events,
    public storage: Storage,
  	public http: Http
  ) {}



  login(idUser: string): void {
    this.storage.set(this.HAS_LOGGED_IN, true);
    this.setUsername(idUser);
    this.events.publish('user:login');
  };




    getDevisAccepted(id:string) {
    


return this.http.get("http://localhost:3000/api/accepted/"+id)
       .toPromise()
       .then(res => res.json(), err => console.log(err));

  };

  //find user by Id


    getExpediteur(id:string) {



return this.http.get("http://localhost:3000/api/user/"+id)
       .toPromise()
       .then(res => res.json(), err => console.log(err));

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
