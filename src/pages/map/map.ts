import { Component, ViewChild, ElementRef } from '@angular/core';

import { ConferenceData } from '../../providers/conference-data';
import {Http} from '@angular/http';
import { Platform,NavParams } from 'ionic-angular';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import 'rxjs/add/operator/filter';
import 'rxjs/Rx';
 import { BackgroundGeolocation,BackgroundGeolocationConfig } from '@ionic-native/background-geolocation';
declare var google: any;


@Component({
  selector: 'page-map',
  templateUrl: 'map.html'
})
export class MapPage {


 public watch: any;   
 positions:any=null; 
   public lat: number=0 ;
  public lng: number=0 ;
public data:any;
  @ViewChild('mapCanvas') mapElement: ElementRef;
  constructor(public confData: ConferenceData, public platform: Platform,public navParams: NavParams,public backgroundGeolocation: BackgroundGeolocation,
  public geolocation: Geolocation,public http: Http) {


 

  }

  ionViewDidLoad() {


    
    var directionsService = new google.maps.DirectionsService;
     var directionsDisplay = new google.maps.DirectionsRenderer;




let options = {
  frequency: 3000, 
  enableHighAccuracy: true
};
 

  
         let mapEle = this.mapElement.nativeElement;

        let map = new google.maps.Map(mapEle, {
          center:{lat: parseInt(this.navParams.data.lat_depart), lng: parseInt(this.navParams.data.lng_depart)},
          zoom: 16
        });


this.geolocation.watchPosition(options).filter((p: any) => p.code === undefined).subscribe((position: Geoposition) => {

   directionsDisplay.setMap(map);
this.positions=position;
  

this.lat = position.coords.latitude;
    this.lng = position.coords.longitude;

console.log(this.lat);

console.log(this.lng);

var start = new google.maps.LatLng(this.lat.toString(), this.lng.toString());
directionsService.route({
          origin:start,
          destination: this.navParams.data.lieu_livraison,
          travelMode: 'DRIVING'
        }, function(response:any, status:any) {
          if (status === 'OK') {
            directionsDisplay.setDirections(response);
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });

      google.maps.event.addListenerOnce(map, 'idle', () => {
          mapEle.classList.add('show-map');
        });



//	});

  
  });




      // });
    

  }

  refresh(){
    this.ionViewDidLoad();
  }


       calculateAndDisplayRoute() {
        var directionsService = new google.maps.DirectionsService;
        var directionsDisplay = new google.maps.DirectionsRenderer;
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 7,
          center: {lat: 41.85, lng: -87.65}
        });
        directionsDisplay.setMap(map);


        directionsService.route({
          origin: "tunis",
          destination: "sousse",
          travelMode: 'DRIVING'
        });
      }


}
