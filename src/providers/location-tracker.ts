import { Injectable, NgZone } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import 'rxjs/add/operator/filter';
import {Http,Headers,RequestOptions} from '@angular/http';
import 'rxjs/Rx';
 import { BackgroundGeolocation,BackgroundGeolocationConfig } from '@ionic-native/background-geolocation';
 declare var google: any;
 import {createClass} from "asteroid";

const Asteroid = createClass();
// Connect to a Meteor backend 
const asteroid = new Asteroid({
    endpoint: "ws://localhost:3000/websocket"
});

@Injectable()
export class LocationTracker {

  public watch: any;    
   public lat: number=0 ;
  public lng: number=0 ;
   public data:any=null;
   public duree:any;
public test:any=null;
public   tab= new Array();
public resultatDistance:any;
public expeditions:any;
course: {longitude_center?:string,latitude_center?:string,longitude_position?:string,latitude_position?:string,offre_id?:string,conducteur_id?:string} = {};

  constructor(public zone: NgZone,public backgroundGeolocation: BackgroundGeolocation,public geolocation: Geolocation,	public http: Http) {
 
  }

  
//  calcDistance(p1:any, p2:any) {
//   return (google.maps.geometry.spherical.computeDistanceBetween(p1,p2) / 1000).toFixed(2);
// }

 
  startTracking() {
 

  // Background Tracking
 
  let config = {

    desiredAccuracy: 0,
    stationaryRadius: 20,
    distanceFilter: 10, 
    debug: true,
    interval: 2000 
  };
 
  this.backgroundGeolocation.configure(config).subscribe((location) => {
 
//this.data=this.test(location.latitude,location.longitude);


    console.log('BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude);
   
    // Run update inside of Angular's zone
    this.zone.run(() => {
      this.lat = location.latitude;
      this.lng = location.longitude;
  this.http.get("https://maps.googleapis.com/maps/api/geocode/json?latlng="+this.lat+","+this.lng+"&key=AIzaSyD1L8YZ760DljgYWqMd8n98w1nUAjjSptM").map(res => res.json().results).subscribe(data => {
      
this.test=data.formatted_address;
	});


  this.load(location.latitude,location.longitude);

//get distance of expeditions :

this.http.get("http://localhost:3000/api/expeditions").map(res => res.json()).subscribe(data => {
console.log("teesst");
var p1 = new google.maps.LatLng(this.data[0].marchandises[0].latitude_expedition,this.data[0].marchandises[0].latitude_livraison);
console.log("p1"+p1);
var p2 = new google.maps.LatLng( location.latitude,  location.longitude)
console.log("p2"+p2);
this.resultatDistance=this.calcDistance(p1, p2);
	console.log("dist"+this.resultatDistance);

},

 err => console.log(err));




});

   
 
  }, (err) => {
 
    console.log(err);
 
  });
 
  // Turn ON the background-geolocation system.
  this.backgroundGeolocation.start();
  
 
  // Foreground Tracking
 
let options = {
  frequency: 3000, 
  enableHighAccuracy: true
};
 
this.watch = this.geolocation.watchPosition(options).filter((p: any) => p.code === undefined).subscribe((position: Geoposition) => {
 
  console.log(position);
  
  // Run update inside of Angular's zone
  this.zone.run(() => {
    this.lat = position.coords.latitude;
    this.lng = position.coords.longitude;
  //  this.http.get("https://maps.googleapis.com/maps/api/geocode/json?latlng="+this.lat+","+this.lng).map(res => res.json().results).subscribe(data => {
  //      this.test=data[5].formatted_address;
  //      console.log(this.test);

	// });

this.load(position.coords.latitude,position.coords.longitude);
//this.http.get("https://maps.googleapis.com/maps/api/geocode/json?latlng="+this.lat+","+this.lng+"&key=AIzaSyD1L8YZ760DljgYWqMd8n98w1nUAjjSptM").map(res => res.json()).subscribe(data => {


asteroid.call('getLatLngDepart',this.lat,this.lng).then(function (data:any) {

this.test=data.results[0].formatted_address;
console.log(data.results[0].formatted_address);
}).catch(function (error:any) {
return error;
});







//	});




  });

  });

  }



  addCourse(longitude_expedition:string,latitude_expedition:string,idConducteur:string,offreId:string){

// Turn ON the background-geolocation system.
  //this.backgroundGeolocation.start();


var headers=new Headers();
headers.append("Accept",'application/json');
headers.append('Content-Type','application/json');
let optionsHeader= new RequestOptions({headers:headers});
  // Foreground Tracking
 
let options = {
  frequency: 3000, 
  enableHighAccuracy: true
};
 
this.geolocation.watchPosition(options).subscribe((position: Geoposition) => {
 
 console.log("pkOk");
this.lat = position.coords.latitude;
    this.lng = position.coords.longitude;

        this.course={longitude_center:this.lng.toString(),latitude_center:this.lat.toString(),longitude_position:longitude_expedition.toString(),latitude_position:latitude_expedition.toString(),offre_id:offreId,conducteur_id:idConducteur};




this.http.get("http://localhost:3000/api/course/"+offreId).map(res => res.json()).subscribe(data => {

// if(data!=null){

// this.http.get("http://localhost:3000/api/update-course/"+offreId+'/'+longitude_expedition+'/'+latitude_expedition).map(res => res.json()).subscribe(data => {
//  console.log(data);

// },
// error =>{
//   console.log(error)
// }
// )

// }

  // else{
this.http.post("http://localhost:3000/api/addCourse", this.course,optionsHeader).subscribe(data => {
 console.log(data);
},
error =>{
  console.log(error)
}
)


// }

},
error =>{
  console.log(error)
}
)


     




  



  });
      





      //test
   }


 calcDistance(p1:any, p2:any) {
  return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000).toFixed(2);
}

 load(latitudeUser:number,longitudeUser:number){
     
    if(this.data){
      return Promise.resolve(this.data);
    }
    return new Promise(resolve =>{
      this.http.get('http://localhost:3000/api/expeditions').map(res => res.json()).subscribe(data =>{
          console.log("oookk");
        this.data = this.applyHaversine(data,latitudeUser,longitudeUser);

        this.data.sort((locationA:any,locationB:any) => {
          return locationA.distanceKM - locationB.distanceKM;
        });
        console.log(this.data);
        resolve(this.data);
      });
    });
  }

  applyHaversine(locations:any,latitudeUser:number,longitudeUser:number){
    let usersLocation = {
      lat: latitudeUser, 
      lng: longitudeUser
    };
 
 console.log(usersLocation);
    locations.map((location:any) => {
 console.log(location);
    let placeLocation = {
      lat: location.marchandises[0].latitude_expedition,
      lng: location.marchandises[0].longitude_expedition
    };
 
    location.distance = this.getDistanceBetweenPoints(
        usersLocation,
        placeLocation,
        'miles'
      ).toFixed(2);
    });

    return locations;
  }
  getDistanceBetweenPoints(start:any, end:any, units:any){
 
        let earthRadius:any = {
            miles: 3958.8,
            km: 6371
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


  stopTracking() {
 
  console.log('stopTracking');
 
  this.backgroundGeolocation.finish();
  this.watch.unsubscribe();
  }
 
}