import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NavParams } from 'ionic-angular';
import {Http} from '@angular/http';
import { AddPage } from '../add-devis/add';
import { ExpeditionProvider } from '../../providers/expedition-provider';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  conferenceDate = '2047-05-17';
  expedition: any = [];
  constructor(public navParams: NavParams,  public expeditionprovider:ExpeditionProvider,public http: Http, public navCtrl: NavController) { 


//this.expeditionprovider.getExpeditionById("rFjTygbLiCe5CpKkW").then(data => this.expedition = data);

	  this.http.get("http://localhost:3000/api/expedition/"+navParams.data._id).map(res => res.json()).subscribe(data => {
        console.log(data);
this.expedition=data;

	});


  }

 
  addDevis(){
console.log("deviss"+this.navParams.data._id);
    this.navCtrl.push(AddPage,{_id:this.navParams.data._id});

  }
}
