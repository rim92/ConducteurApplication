import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import 'rxjs/add/operator/filter';

 import { BackgroundGeolocation,BackgroundGeolocationConfig } from '@ionic-native/background-geolocation';



 



@Injectable()
export class Locations {
  
  data: any;

 public watch: any;    
   public lat: number=0 ;
  public lng: number=0 ;
   public duree:any;
public test:any=null;
public   tab= new Array();
public resultatDistance:any;
public expeditions:any;
  constructor(public backgroundGeolocation: BackgroundGeolocation,public geolocation: Geolocation,	public http: Http) {
 
  }

  load(){

       // Turn ON the background-geolocation system.
  this.backgroundGeolocation.start();
  
 
  // Foreground Tracking
 
let options = {
  frequency: 3000, 
  enableHighAccuracy: true
};
 
this.watch = this.geolocation.watchPosition(options).filter((p: any) => p.code === undefined).subscribe((position: Geoposition) => {
     
    if(this.data){
      return Promise.resolve(this.data);
    }
    return new Promise(resolve =>{
      this.http.get('http://localhost:3000/api/expeditions').map(res => res.json()).subscribe(data =>{
          console.log("oookk");
        this.data = this.applyHaversine(data,position.coords.latitude,position.coords.longitude);
        this.data.sort((locationA:any,locationB:any) => {
          return locationA.distance - locationB.distance;
        });
        resolve(this.data);
      });
    });
      });
  }


  applyHaversine(locations:any,latitude:number,longitude:number){
    let usersLocation = {
    lat : latitude,
    lng : longitude
    };
 
 console.log(usersLocation);
    locations.map((location:any) => {
 console.log(location);
    let placeLocation = {
      lat: location.marchandises[0].latitude_expedition,
      lng: location.marchandises[0].longitude_expedition
    };
 
 console.log(placeLocation);
    location.distance = this.getDistanceBetweenPoints(
        usersLocation,
        placeLocation,
        'miles'
      ).toFixed(2);
    });
    console.log("distance" +location );

    return locations;
  }
  getDistanceBetweenPoints(start:any, end:any, units:any){
 
        let earthRadius:any = {
            miles: 3958.8,
            km: 63
        };
 let x:string='miles';
        let R = earthRadius[units || x];
        let lat1 = start.lat;
        let lon1 = start.lng;
        let lat2 = end.lat;
        let lon2 = end.lng;
 
        let dLat = this.toRad((lat2 - lat1));
        let dLon = this.toRad((lon2 - lon1));
        let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let d = R * c;
 
        return d;
 
    }
 
    toRad(x:any){
        return x * Math.PI / 180;
    }
}
