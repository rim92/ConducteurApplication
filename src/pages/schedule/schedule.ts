import { Component, ViewChild,NgZone } from '@angular/core';

import { AlertController, App, FabContainer, ItemSliding, List, ModalController, NavController, ToastController, LoadingController, Refresher } from 'ionic-angular';
import { OffreProvider } from '../../providers/offre-provider';
import { LocationTracker } from '../../providers/location-tracker';
import { Storage } from '@ionic/storage';
import {Http} from '@angular/http';
import { Subscription } from 'rxjs/Subscription';
import {createClass} from "asteroid";
import 'rxjs/Rx';
/*
  To learn how to use third party libs in an
  Ionic app check out our docs here: http://ionicframework.com/docs/v2/resources/third-party-libs/
*/
// import moment from 'moment';

import { ConferenceData } from '../../providers/conference-data';
import { UserData } from '../../providers/user-data';
import { Observable } from 'rxjs/Observable';
import { SessionDetailPage } from '../session-detail/session-detail';
import { ScheduleFilterPage } from '../schedule-filter/schedule-filter';

import { MapPage } from '../map/map';

const Asteroid = createClass();
// Connect to a Meteor backend 
const asteroid = new Asteroid({
    endpoint: "ws://localhost:3000/websocket"
});

@Component({
  selector: 'page-schedule',
  templateUrl: 'schedule.html'
})
export class SchedulePage  {
  // the list is a child of the schedule page
  // @ViewChild('scheduleList') gets a reference to the list
  // with the variable #scheduleList, `read: List` tells it to return
  // the List and not a reference to the element
  @ViewChild('scheduleList', { read: List }) scheduleList: List;

msg:string=null;
  
  

 
  offres: any = [];
  expediteur: any;
  constructor(
    public app: App,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public offreprovider:OffreProvider,
    public storage: Storage,
    public http: Http,
    public locationtracker:LocationTracker,
    public ngZone:NgZone
  ) {}





  ionViewDidLoad() {
var self=this;

 //Asteroid = createClass();
// Connect to a Meteor backend 
 //Asteroid("ws://localhost:3000/websocket");
   // Call method and use promises

// var x=asteroid.loginWithPassword({email:'rim.methni@esprit.tn',password: '1234'}).then(function (result:any) {
//   console.log('Success:', result);



//  var ret=asteroid.call('findConducteurById',result);
 
// ret.then(function (result:any) {
//   console.log('Success:', result);
// }).catch(function (error:any) {
//   console.error('Error:', error);
// });

// }).catch(function (error:any) {
//   console.error('Error:', error);
// });


// var t=asteroid.subscribe("users");
// t.on('FirstEvent', function (data:any) {
//     console.log('First subscriber: ' + data);
// });
// console.log(t);
    //console.log(z);
 this.storage.get('idUser').then((user_id) => {
console.log(user_id);
 asteroid.call('findConducteurById',user_id).then(function (result:any) {
  console.log('Success:', result);

 asteroid.call('acceptDevis',user_id).then(function (res:any) {
  console.log('devis:', res);
 self.offres=res;
if(res==null){
self.msg="Votre programme est vide";
  console.log("programme vide!");
}
else{
 self.ngZone.run(() => {
asteroid.call('findTempUserById',res[0].expediteur_id).then(function (rest:any) {
  self.expediteur= rest;
console.log(self.expediteur);
}).catch(function (error:any) {
  console.error('Error:', error);
});
});

  // asteroid.subscribe(
  //   'user-finId',                  // name of Meteor Publish function to subscribe to 
  //   user_id,                       // any parameters used by the Publish function 
  //   function () {             // callback when the subscription is complete 
  //     console.log('posts complete:');
  //     console.log(asteroid.collections.users);
  //   }
  // );

//console.log(asteroid.observe("Offres"));


}
 

//self.offreprovider.getExpediteur(id).then(data => this.expediteur=data);



}).catch(function (error:any) {
  console.error('Error:', error);
});



}).catch(function (error:any) {
  console.error('Error:', error);
});
   






    });







  }




  startCourse(idExpedition:string,conducteurId:string,offreId:string){

var self=this;
 asteroid.call('findExpeditionById',idExpedition).then(function (data:any) {
console.log(data);

self.navCtrl.push(MapPage,{lng_depart:data[0].marchandises[0].longitude_expedition,lat_depart:data[0].marchandises[0].latitude_expedition,lieu_livraison:data[0].marchandises[0].lieu_livraison});


self.locationtracker.addCourse(data[0].marchandises[0].longitude_expedition,data[0].marchandises[0].latitude_expedition,conducteurId,offreId);



}).catch(function (error:any) {
  console.error('Error:', error);
});





// var self=this;

//     this.storage.get('idUser').then((value) => {

 
// 	  self.http.get("http://localhost:3000/api/expedition/"+idExpedition).map(res => res.json()).subscribe(data => {

// var id=data[0]._id;
// self.offreprovider.addCourse(id,value.toString());


// 	});
     


      
//     });


  }
  
}
