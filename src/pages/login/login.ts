import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

import { NavController,Platform,MenuController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { LoginProvider } from '../../providers/login-provider';
import { TabsPage } from '../tabs/tabs';
import { SignupPage } from '../signup/signup';
import {Http} from '@angular/http';
import {createClass} from "asteroid";
const Asteroid = createClass();
// Connect to a Meteor backend 
const asteroid = new Asteroid({
    endpoint: "ws://localhost:3000/websocket"
});
@Component({
  selector: 'login',
  templateUrl: 'login.html'
})
export class LoginPage {
  login: {email?: string, password?: string} = {};
  submitted = false;

  constructor(public navCtrl: NavController,public http: Http,  public storage: Storage, public loginProvider: LoginProvider,public platform:Platform,public menu: MenuController,) {

  //  this.onNotification();





   }



  ionViewDidLoad() {
this.platform.ready().then(() => {
 this.enableMenu(false);
    // FCMPlugin.getToken(function(t:any){
    //   console.log("Use this token for sending device specific messages\nToken: " + t);
    // }, function(e:any){
    //   console.log("Uh-Oh!\n"+e);
    // });

    // FCMPlugin.onNotification(function(d:any){
    //   if(d.wasTapped){  
    //     // Background recieval (Even if app is closed),
    //     //   bring up the message in UI
    //   } else {
    //     // Foreground recieval, update UI or what have you...
    //   }
    // }, function(msg:any){
    //   // No problemo, registered callback
    // }, function(err:any){
    //   console.log("Arf, no good mate... " + err);
    // });
  
});

}
  onLogin(form: NgForm) {
    this.submitted = true;

var self=this;




var x=asteroid.loginWithPassword({email:this.login.email,password:this.login.password}).then(function (result:any) {
self.loginProvider.login(result);
 self.loginProvider.hasLoggedIn();
//  var ret=asteroid.call('findConducteurById',result);
 
// ret.then(function (res:any) {
//   console.log(res._id)
 
//   self.navCtrl.push(TabsPage);
console.log(result);
}).catch(function (error:any) {
  console.error('Error:', error);
});

// }).catch(function (error:any) {
//   console.error('Error:', error);
// });



  
// 	  this.http.get("http://localhost:3000/api/auth/"+this.login.email+"/"+this.login.password).map(res => res.json()).subscribe(data => {
//         console.log(data);
// if(data!=null){

//   this.loginProvider.login(data._id);
//   var x=this.loginProvider.hasLoggedIn();
//   console.log("valeur login"+x);
//   this.navCtrl.push(TabsPage);
// }

// else{
  
//   console.log("erreUr d authentif");
// }
// 	});


      
    
  }




  enableMenu(loggedIn: boolean) {
    this.menu.enable(loggedIn, 'loggedInMenu');
    this.menu.enable(!loggedIn, 'loggedOutMenu');
  }


  async onNotification(){
    try{

      await(this.platform.ready());
      FCMPlugin.onNotification((data:any) => {
console.log(data);

      })
    }

    catch(e){
      console.error(e);
    }
  }

  onSignup() {
    this.navCtrl.push(SignupPage);
  }
}
