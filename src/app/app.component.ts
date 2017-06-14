import { Component, ViewChild } from '@angular/core';

import { Events, MenuController, Nav, Platform } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';

import { Storage } from '@ionic/storage';

import { AboutPage } from '../pages/about/about';
import { AccountPage } from '../pages/account/account';
import { LoginPage } from '../pages/login/login';
import { MapPage } from '../pages/map/map';
import { SignupPage } from '../pages/signup/signup';
import { TabsPage } from '../pages/tabs/tabs';
import { TutorialPage } from '../pages/tutorial/tutorial';
import { SchedulePage } from '../pages/schedule/schedule';
import { SpeakerListPage } from '../pages/speaker-list/speaker-list';
import { SupportPage } from '../pages/support/support';
import {Http} from '@angular/http';
import {ExpeditionsPage} from '../pages/expeditions/expeditions';
import { ConferenceData } from '../providers/conference-data';
import { LoginProvider } from '../providers/login-provider';

export interface PageInterface {
  title: string;
  name: string;
  component: any;
  icon: string;
  logsOut?: boolean;
  index?: number;
  tabName?: string;
  tabComponent?: any;
}

@Component({
  templateUrl: 'app.template.html'
})
export class ConferenceApp {
  // the root nav is a child of the root app component
  // @ViewChild(Nav) gets a reference to the app's root nav
  @ViewChild(Nav) nav: Nav;

  // List of pages that can be navigated to from the left menu
  // the left menu only works after login
  // the login page disables the left menu
  appPages: PageInterface[] = [
    { title: 'Mes courses', name: 'TabsPage', component: TabsPage, tabComponent: SchedulePage, index: 0, icon: 'calendar' },
    { title: 'Expeditions', name: 'TabsPage', component: TabsPage, tabComponent: ExpeditionsPage, index: 1, icon: 'information-circle' },
    { title: 'Mes trajets', name: 'TabsPage', component: TabsPage, tabComponent: MapPage, index: 2, icon: 'map' },
    { title: 'Mes contacts', name: 'TabsPage', component: TabsPage, tabComponent: AboutPage, index: 3, icon: 'contacts' }
  ];
  loggedInPages: PageInterface[] = [
    { title: 'Account', name: 'AccountPage', component: AccountPage, icon: 'person' },
    { title: 'Support', name: 'SupportPage', component: SupportPage, icon: 'help' },
    { title: 'Logout', name: 'TabsPage', component: TabsPage, icon: 'log-out', logsOut: true }
  ];
  // loggedOutPages: PageInterface[] = [
  //   { title: 'Login', name: 'LoginPage', component: LoginPage, icon: 'log-in' },
  //   { title: 'Support', name: 'SupportPage', component: SupportPage, icon: 'help' },
  //   { title: 'Signup', name: 'SignupPage', component: SignupPage, icon: 'person-add' }
  // ];
  rootPage: any;
  result: any = [];
  constructor(
    public events: Events,
    public loginProvider: LoginProvider,
    public menu: MenuController,
    public platform: Platform,
    public confData: ConferenceData,
    public storage: Storage,
    public splashScreen: SplashScreen,
    	public http: Http
  ) {

//authetification



  //   this.storage.get('userId')
  //     .then((id) => {
  //       console.log("IDD"+id);

  //        if (id==undefined) {
  //    this.rootPage=LoginPage;

  //        }
  //        else{
  //  this.rootPage=TabsPage;

  //        }



this.loginProvider.hasLoggedIn().then((hasLoggedIn) => {
  
if(hasLoggedIn==false){
    this.rootPage=LoginPage;

}
else{
          this.enableMenu(true);
    this.rootPage=ExpeditionsPage; 
}


    });
        this.platformReady()
     


  }



  ionViewDidLoad() {



  }

  openPage(page: PageInterface) {
    let params = {};

    // the nav component was found using @ViewChild(Nav)
    // setRoot on the nav to remove previous pages and only have this page
    // we wouldn't want the back button to show in this scenario
    if (page.index) {
      params = { tabIndex: page.index };
    }

    // If we are already on tabs just change the selected tab
    // don't setRoot again, this maintains the history stack of the
    // tabs even if changing them from the menu
    if (this.nav.getActiveChildNav() && page.index != undefined) {
      this.nav.getActiveChildNav().select(page.index);
    // Set the root of the nav with params if it's a tab index
  } else {
      this.nav.setRoot(page.name, params).catch((err: any) => {
        console.log(`Didn't set nav root: ${err}`);
      });
    }


      // Give the menu time to close before changing to logged out
     // this.loginProvider.logout();
   

    
  }

  Logout(){

      console.log("ook");
  //   this.storage.remove("userId");
  this.loginProvider.logout();
  this.rootPage=LoginPage;
  }

  openTutorial() {
    this.nav.setRoot(TutorialPage);
  }

  listenToLoginEvents() {
    this.events.subscribe('user:login', () => {
      this.enableMenu(false);
    });

  
    this.events.subscribe('user:logout', () => {
      this.enableMenu(false);
    });
  }

  enableMenu(loggedIn: boolean) {
    this.menu.enable(loggedIn, 'loggedInMenu');
    this.menu.enable(!loggedIn, 'loggedOutMenu');
  }

  platformReady() {
    // Call any initial plugins when ready
    this.platform.ready().then(() => {
      this.splashScreen.hide();
    });
  }

  isActive(page: PageInterface) {
    let childNav = this.nav.getActiveChildNav();

    // Tabs are a special case because they have their own navigation
    if (childNav) {
      if (childNav.getSelected() && childNav.getSelected().root === page.tabComponent) {
        return 'primary';
      }
      return;
    }

    if (this.nav.getActive() && this.nav.getActive().name === page.name) {
      return 'primary';
    }
    return;
  }
}
