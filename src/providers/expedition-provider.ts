import { Injectable } from '@angular/core';

import { Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
@Injectable()
export class ExpeditionProvider {

  HAS_LOGGED_IN = 'hasLoggedIn';
  HAS_SEEN_TUTORIAL = 'hasSeenTutorial';
public testexp:any=[];
  constructor(
    public events: Events,
    public storage: Storage,
    	public http: Http
  ) {}



  getExpediteurs() {
    


return this.http.get("http://localhost:3000/api/expeditions")
       .toPromise()
       .then(res => res.json(), err => console.log(err));

  };



  getExpeditionById(id:string) {
    


return this.testexp=this.http.get("http://localhost:3000/api/expedition/"+id)
       .toPromise()
       .then(res =>{ res.json(),
         console.log(res.json())
       },
       
        err => console.log(err));

  };


  


getAddress(lng:string,lat:string){

  return this.http.get("http://maps.googleapis.com/maps/api/geocode/json?latlng="+lat+","+lng).toPromise().then(res => res.json(), err => console.log(err));
}


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
