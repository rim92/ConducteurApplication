import { Component, ViewChild,ElementRef } from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';



import { AlertController, App, FabContainer,ItemSliding,Platform, List, ModalController, NavController, ToastController, LoadingController, Refresher } from 'ionic-angular';

import { Geolocation } from '@ionic-native/geolocation';
/*
  To learn how to use third party libs in an
  Ionic app check out our docs here: http://ionicframework.com/docs/v2/resources/third-party-libs/
*/
// import moment from 'moment';

import { ConferenceData } from '../../providers/conference-data';
import { UserData } from '../../providers/user-data';
import { ExpeditionProvider } from '../../providers/expedition-provider';
import { SessionDetailPage } from '../session-detail/session-detail';
import { ScheduleFilterPage } from '../schedule-filter/schedule-filter';
import { LocationTracker } from '../../providers/location-tracker';
import { AboutPage } from '../about/about';
import { Locations } from '../../providers/locations';
import { MapPage } from '../map/map';
@Component({
  selector: 'page-expeditions',
  templateUrl: 'expeditions.html'
})
export class ExpeditionsPage {
  // the list is a child of the schedule page
  // @ViewChild('scheduleList') gets a reference to the list
  // with the variable #scheduleList, `read: List` tells it to return
  // the List and not a reference to the element
@ViewChild('scheduleList', { read: List }) scheduleList: List;

  dayIndex = 0;
  queryText = '';
  segment = 'all';
  excludeTracks: any = [];
  shownSessions: any = [];
  groups: any = [];
  local:any;
  expediteurs: any = [];
  result: any = [];
  confDate: string;
test:any;


  constructor(
    public alertCtrl: AlertController,
    public app: App,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    public confData: ConferenceData,
    public user: UserData,
	public http: Http,
  public platform:Platform,
  public expeditionprovider:ExpeditionProvider,
  public locationTracker: LocationTracker,public geolocation: Geolocation,
  public locations: Locations

  ) {

 

  }
 
 



  

  ionViewDidLoad() {
   this.expeditionprovider.getExpediteurs().then(data => this.expediteurs = data);

this.locationTracker.startTracking();
console.log(this.locationTracker);
console.log(this.locationTracker.test);
this.locations.load();




  }



  

  

  updateSchedule() {
    // Close any open sliding items when the schedule updates
    this.scheduleList && this.scheduleList.closeSlidingItems();

    this.confData.getTimeline(this.dayIndex, this.queryText, this.excludeTracks, this.segment).subscribe((data: any) => {
      this.shownSessions = data.shownSessions;
      this.groups = data.groups;
	  
	  
    });
	//test
	

  }

  presentFilter() {
    let modal = this.modalCtrl.create(ScheduleFilterPage, this.excludeTracks);
    modal.present();

    modal.onWillDismiss((data: any[]) => {
      if (data) {
        this.excludeTracks = data;
        this.updateSchedule();
      }
    });

  }

  goToSessionDetail(sessionData: any) {
    // go to the session detail page
    // and pass in the session data
    this.navCtrl.push(SessionDetailPage, {
      name: sessionData.name,
      session: sessionData
    });
  }

  addFavorite(slidingItem: ItemSliding, sessionData: any) {

    if (this.user.hasFavorite(sessionData.name)) {
      // woops, they already favorited it! What shall we do!?
      // prompt them to remove it
      this.removeFavorite(slidingItem, sessionData, 'Favorite already added');
    } else {
      // remember this session as a user favorite
      this.user.addFavorite(sessionData.name);

      // create an alert instance
      let alert = this.alertCtrl.create({
        title: 'Favorite Added',
        buttons: [{
          text: 'OK',
          handler: () => {
            // close the sliding item
            slidingItem.close();
          }
        }]
      });
      // now present the alert on top of all other content
      alert.present();
    }

  }

  removeFavorite(slidingItem: ItemSliding, sessionData: any, title: string) {
    let alert = this.alertCtrl.create({
      title: title,
      message: 'Would you like to remove this session from your favorites?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            // they clicked the cancel button, do not remove the session
            // close the sliding item and hide the option buttons
            slidingItem.close();
          }
        },
        {
          text: 'Remove',
          handler: () => {
            // they want to remove this session from their favorites
            this.user.removeFavorite(sessionData.name);
            this.updateSchedule();

            // close the sliding item and hide the option buttons
            slidingItem.close();
          }
        }
      ]
    });
    // now present the alert on top of all other content
    alert.present();
  }

  openSocial(network: string, fab: FabContainer) {
    let loading = this.loadingCtrl.create({
      content: `Posting to ${network}`,
      duration: (Math.random() * 1000) + 500
    });
    loading.onWillDismiss(() => {
      fab.close();
    });
    loading.present();
  }

  doRefresh(refresher: Refresher) {
    this.confData.getTimeline(this.dayIndex, this.queryText, this.excludeTracks, this.segment).subscribe((data: any) => {
      this.shownSessions = data.shownSessions;
      this.groups = data.groups;

      // simulate a network request that would take longer
      // than just pulling from out local json file
      setTimeout(() => {
        refresher.complete();

        const toast = this.toastCtrl.create({
          message: 'Sessions have been updated.',
          duration: 3000
        });
        toast.present();
      }, 1000);
    });
  }




getTraject(){

// console.log("ook");

//   this.navCtrl.push(MapPage);
//   // get current position
//    this.geolocation.getCurrentPosition().then(pos => {
//         console.log('lat: ' + pos.coords.latitude + ', lon: ' + pos.coords.longitude);
//       });
//       const watch = this.geolocation.watchPosition().subscribe(pos => {
//         console.log('lat: ' + pos.coords.latitude + ', lon: ' + pos.coords.longitude);
//       });

//       // to stop watching
//       watch.unsubscribe();
  
// Geolocation.getCurrentPosition()
//       .then(
//       (location:any) => {
//         console.log('Location successful')
//         this.local.lat = location.coords.latitude;
//         this.local.lng = location.coords.longitude;
//       }
//       )
  }

calculateAndDisplayRoute(depart:string,livraison:string){
    this.navCtrl.push(MapPage,{lieu_expedition:depart,lieu_livraison:livraison});
}


getDetail(id:string){

    this.navCtrl.push(AboutPage,{
      _id: id
    });

}

  start(){
   // this.locationTracker.startTracking();
console.log("okk");
  this.navCtrl.push(MapPage);

  }
 
  stop(){
    this.locationTracker.stopTracking();
  }

  
}



