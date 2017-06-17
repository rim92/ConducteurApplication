import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

import { NavController,NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { OffreProvider } from '../../providers/offre-provider';
import { TabsPage } from '../tabs/tabs';

import {Http,Headers,RequestOptions} from '@angular/http';

@Component({
  selector: 'devis',
  templateUrl: 'add.html'
})
export class AddPage {
  offre: {montant?: string, date?: any, heure?: any,conducteur_id?:string,expedition_id?:string,accepted?:boolean,expediteur_id?:string} = {};
  submitted = false;
  conferenceDate = new Date();
  conducteur:string;
test:any;
  constructor(public navCtrl: NavController,public http: Http,  public storage: Storage, public offreProvider: OffreProvider,public navParams: NavParams) {


   }

  AddOffre(offreForm: NgForm) {
    this.submitted = true;

var headers=new Headers();
headers.append("Accept",'application/json');
headers.append('Content-Type','application/json');
let options= new RequestOptions({headers:headers});

 this.storage.get('idUser').then((value) => {


this.http.get("http://localhost:3000/api/user/"+value).map(res => res.json()).subscribe(data => {
console.log(data[0].profile[0].conducteur_id);


  this.offre={montant:this.offre.montant.toString(),date:this.offre.date,heure:this.offre.heure,conducteur_id:data[0].profile[0].conducteur_id,expedition_id:this.navParams.data._id,accepted:false,expediteur_id:null};


this.http.post("http://localhost:3000/api/devis", this.offre,options).subscribe(data => {
 //console.log(data["_body"]);
},
error =>{
  console.log(error)
}
);

});

});
      





      //test
   }


}
