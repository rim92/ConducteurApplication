import { WebSocket } from 'mock-socket';
import { Observable } from 'rxjs';
import { DDPClient } from './ddp-client';
import { DDPCacheEngine } from './ddp-storage';

export type MY_DDP_COLLECTIONS = 'users' | 'chats';
export const MY_DDP_COLLECTIONS = {
    USERS: 'users' as MY_DDP_COLLECTIONS
   
};

export interface IUser {
    _id: string;
    full_name: string;
    email: string;
}

export class MyDDPClient extends DDPClient {
ddpplient:DDPClient;
    public ddpStatus: {
        isConnected: boolean;
        isDisconnected: boolean;
    };

    constructor() {
        super();

        this.ddpStatus = {
            isConnected: false,
            isDisconnected: true,
        };
    }

    initCacheStorage(cacheEngine: DDPCacheEngine) {

        this.ddpStorage.setCacheEngine(cacheEngine);
       
    }

    connect() {
        const ddpServerUrl = 'ws://localhost:3000/websocket';
        super.connect(ddpServerUrl);


//this.ddpStorage.getItem("Tempusers","jknk");
    }

    login() {
        return this.callWithPromise('login', {
            email: '111',
            password: '111'
        });
    }

    logout() {
      //  this.ddpStorage.clearCache([MY_DDP_COLLECTIONS.CHATS]);
        super.close();
    }

    // Events called by DDPClient
    onConnected() {
        // DDP connected, now we can login and subscribe to the publications on the server

        this.ddpStatus.isConnected = true;
        this.ddpStatus.isDisconnected = false;

        // this.login()
        //     .then(() => {
        //         this.subscribePublications();
        //         this.observeCollections();
        //     });





    }

    onDisconnected() {
        // DDP disconnected, notify user

        this.ddpStatus.isConnected = true;
        this.ddpStatus.isDisconnected = false;
    }

    onSocketError(error:any) {
        // Custom code on Socket error
    }

    onSocketClosed() {
        // Custom code on Socket closed
    }

    onMessage(data:any) {
        // Custom code for handle special DDP server messages
    }

    // Custom utility methos
    subscribePublications() {
        const since = this.ddpStorage.lastSyncTime;
        this.subscribe('users', [since]);
      //  this.subscribe('chats', [since]);
    }

    observeCollections() {
        this.observeCollection<IUser[]>(MY_DDP_COLLECTIONS.USERS)
            .subscribe(items => console.log('Users:', items));
    }


    
    getAllCollectionData$(collectionName: MY_DDP_COLLECTIONS) {
        // To access data direcly from the collection you can use the ddpStorage methods
        return this.ddpStorage.getObservable(collectionName);
    }
}
