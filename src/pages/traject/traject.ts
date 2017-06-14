import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

import { NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { LoginProvider } from '../../providers/login-provider';
import { TabsPage } from '../tabs/tabs';
import { SignupPage } from '../signup/signup';
import {Http} from '@angular/http';
import { Platform } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
@Component({
  selector: 'page-traject',
  templateUrl: 'traject.html'
})
export class TrajectPage {
 // traject: {depart: string, destination: string,conducteur_id:string} = {};
  submitted = false;
loginProvider: LoginProvider;
  constructor(private platform: Platform, public navCtrl: NavController,public http: Http,  public storage: Storage,private geolocation: Geolocation) {

    platform.ready().then(() => {

      // get current position
      this.geolocation.getCurrentPosition().then(pos => {
        console.log('lat: ' + pos.coords.latitude + ', lon: ' + pos.coords.longitude);
      });

      const watch = this.geolocation.watchPosition().subscribe(pos => {
        console.log('lat: ' + pos.coords.latitude + ', lon: ' + pos.coords.longitude);
      });

      // to stop watching
      watch.unsubscribe();

    });

   }

  addTraject(form: NgForm) {


 this.loginProvider.getUsername().then((id) => {
     
console.log("iduser"+id);

    })

//     this.submitted = true;

  
// 	  this.http.get("http://localhost:3000/api/trajet/"+this.login.email+"/"+this.login.password).map(res => res.json()).subscribe(data => {
//         console.log(data);
// if(data!=null){
//   this.loginProvider.login(data._id);
//   var x=this.loginProvider.hasLoggedIn();
//   console.log("valeur login"+x);
//   this.navCtrl.push(TabsPage);
// }

// else{
//   console.log("erreir d authentif");
// }
// 	});
      
    
  }



  onSignup() {
    this.navCtrl.push(SignupPage);
  }
}
