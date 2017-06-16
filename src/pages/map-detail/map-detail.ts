import { Component, ViewChild, ElementRef } from '@angular/core';

import { ConferenceData } from '../../providers/conference-data';

import { Platform ,NavController,NavParams} from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';

declare var google: any;


@Component({
  selector: 'page-detail-map',
  templateUrl: 'map-detail.html'
})
export class MapDetailPage {

  @ViewChild('mapCanvas') mapElement: ElementRef;
  constructor(public confData: ConferenceData, public platform: Platform,public navParams: NavParams) {
  }

  ionViewDidLoad() {
    var directionsService = new google.maps.DirectionsService;
     var directionsDisplay = new google.maps.DirectionsRenderer;
      this.confData.getMap().subscribe((mapData: any) => {
        let mapEle = this.mapElement.nativeElement;

        let map = new google.maps.Map(mapEle, {
          center:{lat: 41.85, lng: -87.65},
          zoom: 16
        });

   directionsDisplay.setMap(map);
        // mapData.forEach((markerData: any) => {
        //   let infoWindow = new google.maps.InfoWindow({
        //     content: `<h5>${markerData.name}</h5>`
        //   });

        //   let marker = new google.maps.Marker({
        //     position: markerData,
        //     map: map,
        //     title: markerData.name
        //   });

        //   marker.addListener('click', () => {
        //     infoWindow.open(map, marker);
        //   });
        // });


   directionsService.route({
          origin: this.navParams.data.lieu_expedition,
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

      });

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
