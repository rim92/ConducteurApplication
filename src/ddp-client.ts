import { Observable } from 'rxjs/Observable';
import * as EJSON from 'ejson';
import * as _ from 'underscore';
import { DDPStorage } from './ddp-storage';

import { DDP_COLLECTIONS } from './ddp-names';

export declare abstract class OnDDPMessage {
    abstract onMessage(data:any): void;
}

export declare abstract class OnDDPConnected {
    abstract onConnected(): void;
}

export declare abstract class OnDDPDisconnected {
    abstract onDisconnected(): void;
}

export declare abstract class OnSocketClosed {
    abstract onSocketClosed(event:any): void;
}

export declare abstract class OnSocketError {
    abstract onSocketError(error:any): void;
}

export interface IDDPClientSettings {
    url?: string;
    host?: string;
    port?: number;
    ssl?: boolean;
    path?: string;
    ddpVersion?: string;
    socketContructor?: any;
    pingInterval?: number;
    reconnectInterval?: number;
}

const SUPPORTED_DDP_VERSIONS = ['1', 'pre2', 'pre1'];

export class DDPClient implements OnDDPMessage, OnDDPConnected, OnDDPDisconnected, OnSocketClosed, OnSocketError {

    protected _isConnecting: boolean;
    protected _isConnected: boolean;
    protected _isClosed: boolean;

    protected _nextId: number;
    protected _callbacks: { [key: number]: Function };
    protected _updatedCallbacks: { [key: number]: Function };
    protected _pendingMethods: { [key: number]: Function };

    protected session: string;
    protected socket: WebSocket;
    protected ddpSettings: IDDPClientSettings;
    protected ddpStorage: DDPStorage;
    protected socketConstructor: WebSocket | any;

    protected pingInterval: number;
    protected reconnectTimeout: number;

    protected reconnectStatus: {
        attempt: number;
        nextDelay: number;
    };

    constructor(ddpSettings?: IDDPClientSettings) {

        // default settings
        this.ddpSettings = Object.assign({}, ddpSettings, {
            url: 'ws://localhost:3000/websocket',
            host: 'localhost',
            port: 3000,
            path: 'websocket',
            ssl: false,
            ddpVersion: '1',
            socketContructor: WebSocket,
            pingInterval: 30000,
            reconnectInterval: 30000,
        } as IDDPClientSettings);

        this.ddpStorage = new DDPStorage();

        // internal stuff to track callbacks
        this._isConnecting = false;
        this._isConnected = false;
        this._isClosed = false;
        this._nextId = 0;
        this._callbacks = {};
        this._updatedCallbacks = {};
        this._pendingMethods = {};
        this.reconnectStatus = {
            attempt: 0,
            nextDelay: 0,
        };
    }

    //////////////////////////////////////////////////////////////////////////

    /**
     * Open a WebSocket connection to the server (if not already open or in progress)
     * Fire the onConnected when server respond with "connected"
     * @param {string} url if Url is provided, we connect directily to the url instead of using the DDPClientSettings
     */
    connect(url:any = undefined) {

        if (this._isConnecting || this._isConnected) {
            // DDP already connected or connecting, skip
            console.info('DDP connect() called more then once: isConnecting',
                this._isConnecting, ' - isConnected', this._isConnected);
            return;
        }

        this._isConnecting = true;
        this._isConnected = false;
        this._isClosed = false;

        this.ddpSettings.url = this.ddpSettings.url || url || this._createUrlFromSettings();

        this.socket = new this.ddpSettings.socketContructor(this.ddpSettings.url);

        this.socket.onopen = () => {
            // When socket open, send DDP "connect" message
            this._send({
                msg: 'connect',
                version: this.ddpSettings.ddpVersion,
                support: SUPPORTED_DDP_VERSIONS
            });
        };

        this.socket.onerror = (error:any) => {
            // error received before connection was established
            if (this._isConnecting) {
                this._failed('Socket error happened before the connection', error);
            } else {
                this._failed(error.message);
            }
            this.disconnect(true); // disconnect and close the socket
            this.onSocketError(error);
        };

        this.socket.onclose = (event:any) => {
            this._endPendingMethodCalls();
            this.disconnect(true);
            this.onSocketClosed(event);
        };

        this.socket.onmessage = (event:any) => {
            this._message(event.data);
        };
    }

    

    /**
     * Close the WebSocket (if not already close)
     * Fire the onDisconnected in any case
     */
    disconnect(needToReconnect = false) {

        if (needToReconnect === false) {
            clearTimeout(this.reconnectTimeout);
        }

        if (this._isClosed) {
            // Socket already close, skip
            console.info('DDP disconnect() called more then once: socket already closed')
            return;
        }

        this._isConnecting = false;
        this._isConnected = false;
        this._isClosed = true;

        this.close();

        this._disconnected(needToReconnect);
    }

    /**
     * If a there is a WebSocket instance and is not CLOSED, call the socket.close() method
     * Reset also the onclose and onerror callbacks to avoid multiple disconnect() calls
     */
    close() {

        if (this.socket) {

            this.socket.onclose = () => { };
            this.socket.onerror = () => { };

            if (this.socket.readyState !== WebSocket.CLOSED) {
                this.socket.close();
            }

            delete this.socket;
        }
    }

    ping() {

        this._send({
            msg: 'ping'
        });
    }


    ///// Events that parent can attach to /////

    /**
     * Fired when socket had and error
     */
    public onSocketError(error:any) {

    }

    /**
     * Fired when socket close
     */
    public onSocketClosed(event:any) {

    }

    /**
     * Fired when socket received a message
     * @param {EJSON} data message data in EJSON format
     */
    public onMessage(data:any) {

    }

    /**
     * Fired when respond with "connected" message
     * @param {EJSON} EJSON data
     */
    public onConnected() {

    }

    /**
     * Just for nofity errors. Fired when socket get an error or DDP server connection failed
     * @param {string} reason Error/reason of the exception
     */
    public onFailed(reason:any) {

    }

    /**
     * Fired when DDP become unusable (socket close, ddp do not respond, handshake failed)
     */
    public onDisconnected() {

    }

    /**
     * @whatItDoes call a method on the server
     * @description
     * @param {string} name of the DDP method to call
     * @param {any} object containing the params to send to the method (encode as EJSON)
     * @param {Function} callback called with the result when the server respond RESULT
     * @param {Function} updatedCallback called when the server respond UPDATE
     */
    public  call(name: string, params:any, callback: Function, updatedCallback?: Function) {

        const id :any= this._getNextId();

        const _self = this;
        this._callbacks[id] = function () {
            delete _self._pendingMethods[id];

            if (callback) {
                callback.apply(this, arguments);
            }
        };

        this._updatedCallbacks[id] = function () {
            delete _self._pendingMethods[id];

            if (updatedCallback) {
                updatedCallback.apply(this, arguments);
            }
        };

      //  this._pendingMethods[id] = true;

        const sendStatus = this._send({
            msg: 'method',
            id: id,
            method: name,
            params: params
        });

        if (!sendStatus) {
            this._notifySendFail(id);
        }

        return sendStatus;
    }

    protected callWithPromise(name: string, params:any) {

        return new Promise((resolve:any, reject:any) => {
            this.call(name, params, (error:any, result:any) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    protected callWithRandomSeed(name: string, params:any, randomSeed:any, callback:any, updatedCallback:any) {

        const id:any = this._getNextId();

        if (callback) {
            this._callbacks[id] = callback;
        }

        if (updatedCallback) {
            this._updatedCallbacks[id] = updatedCallback;
        }

        const sendStatus = this._send({
            msg: 'method',
            id: id,
            method: name,
            randomSeed: randomSeed,
            params: params
        });

        if (!sendStatus) {
            this._notifySendFail(id);
        }
    }

    /**
     * open a subscription on the server,
     * callback should handle on ready and nosub
     */
    protected subscribe(name: string, params:any, unsubscribeCallback?: Function) {

        const id:any = this._getNextId();

        if (unsubscribeCallback) {
            this._callbacks[id] = unsubscribeCallback;
        }

        const sendStatus = this._send({
            msg: 'sub',
            id: id,
            name: name,
            params: params
        });

        if (!sendStatus) {
            this._notifySendFail(id);
        }

        return id;
    }

    protected unsubscribe(id: string) {

        this._send({
            msg: 'unsub',
            id: id
        });
    }

    protected observeCollection<T>(collectionName: DDP_COLLECTIONS) {
        return this.ddpStorage.getObservable(collectionName) as Observable<T>;
    }

    protected getItemFromCollection(collectionName: DDP_COLLECTIONS, value: any, fieldName = '_id') {

        // const query = {};
        // query[fieldName] = value;

        const itemsFound = this.ddpStorage.getItem(collectionName, value);

        return itemsFound;
    }

    protected convertToEJSON(data:any) {
        return EJSON.stringify(data);
    }

    // handle send msg via WebSocket
    private _send(data:any) {

        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.info('DDP connection is not yet open, Cannot call', data);
            return false;
        }

        this.socket.send(
            this.convertToEJSON(data)
        );

        return true;
    }

    /**
     * handle a message from the server
     */
    private _message(data:any) {

        data = EJSON.parse(data);

        this.onMessage(data);

        let cb:any = undefined;

        switch (data.msg) {
            case 'failed':
                if (SUPPORTED_DDP_VERSIONS.indexOf(data.version) !== -1) {
                    this.ddpSettings.ddpVersion = data.version;
                    this._failed('Server and client have different DDP version');
                } else {
                    this._failed('Cannot negotiate DDP version');
                }
                break;
            case 'connected':
                this.session = data.session;
                this._connected();
                break;
            // method result
            case 'result':
                cb = this._callbacks[data.id];

                if (cb) {
                    cb(data.error, data.result);
                    delete this._callbacks[data.id];
                }
                break;
            // method updated
            case 'updated':
                _.each(data.methods, (method: any) => {
                    cb = this._updatedCallbacks[method];

                    if (cb) {
                        cb();
                        delete this._updatedCallbacks[method];
                    }
                });
                break;
            // missing subscription
            case 'nosub':
                cb = this._callbacks[data.id];

                if (cb) {
                    cb(data.error);
                    delete this._callbacks[data.id];
                }
                break;
            // add document to collection
            case 'added':
                if (data.collection) {
                    const collectionName:any = data.collection;
                    const id:any = data.id;
                    const item :any= {
                        '_id': id
                    };

                    if (data.fields) {
                        _.each(data.fields, (value:any, key:any) => {
                            item[key] = value;
                        });
                    }

                    this.ddpStorage.insertItem(collectionName, item);
                }
                break;
            // remove document from collection
            case 'removed':
                if (data.collection) {
                    const collectionName:any = data.collection;
                    const id:any = data.id;

                    this.ddpStorage.removeItem(collectionName, id);
                }
                break;
            // change document in collection
            case 'changed':
                if (data.collection) {
                    const collectionName :any= data.collection;
                    const id :any= data.id;
                    const item :any= {
                        '_id': id
                    };

                    if (data.fields) {
                        _.each(data.fields, (value:any, key:any) => {
                            item[key] = value;
                        });
                    }

                    this.ddpStorage.updateItem(collectionName, id, item);
                }
                break;
            // subscriptions ready
            case 'ready':
                _.each(data.subs, (id: any) => {
                    cb = this._callbacks[id];
                    if (cb) {
                        cb();
                        delete this._callbacks[id];
                    }
                });
                break;
            // minimal heartbeat response for ddp pre2
            case 'ping':
                this._send(
                    _.has(data, 'id') ? { msg: 'pong', id: data.id } : { msg: 'pong' }
                );
                break;
            // server respond to my ping
            case 'pong':
                // TODO: set up a system to detect if the server did not respond to my ping (server down)
                break;
            // Beep
            case 'beep':
                // Handle by the parent
                break;
            case 'server_id':
                // Server just tell us his ID
                break;
            // Error
            case 'error':
                console.warn('DDP error', data.error, data.reason);
                break;
            default:
                console.warn('DDP cannot handle this message', data);
                break;
        }
    }

    // handle DDP connected (ddp msg received from Server)
    private _connected() {

        this._isConnecting = false;
        this._isConnected = true;
        this._isClosed = false;

        this.reconnectStatus = {
            attempt: 0,
            nextDelay: 0,
        };

        if (this.pingInterval) {
            clearInterval(this.pingInterval);
        }

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        this.pingInterval = setInterval(
            () => this.ping(),
            this.ddpSettings.pingInterval) as any;

        this.onConnected();
    }

    private _disconnected(needToReconnect: boolean) {

        this._isConnecting = false;
        this._isConnected = false;
        this._isClosed = true;

        if (this.pingInterval) {
            clearInterval(this.pingInterval);
        }

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        if (needToReconnect) {
            this.reconnectStatus.attempt = this.reconnectStatus.attempt + 1;
            this.reconnectStatus.nextDelay = this.reconnectStatus.attempt * 5000;
            this.reconnectTimeout = setTimeout(() => {
                this.connect();
                clearTimeout(this.reconnectTimeout);
            }, this.ddpSettings.reconnectInterval + this.reconnectStatus.nextDelay) as any;
        } else {
            this.reconnectStatus.attempt = 0;
            this.reconnectStatus.nextDelay = 0;
        }

        this.onDisconnected();
    }

    /**
     * Fire the onFailed every time eather the socket drop (error) or the handshake wih DDP failed
     */
    private _failed(errorMessage:any, exception:any = undefined) {

        this.onFailed(errorMessage);
    }

    private _notifySendFail(id:any) {
        const cb :any= this._callbacks[id];

        if (cb) {
            cb('Connection to the server failed', undefined);
            delete this._callbacks[id];
        }
    }

    private _createUrlFromSettings() {

        const path:any = (this.ddpSettings.path.indexOf('/') === 0) ? this.ddpSettings.path : '/' + this.ddpSettings.path;
        const protocol:any = this.ddpSettings.ssl ? 'wss://' : 'ws://';
        const url :any= `${protocol}${this.ddpSettings.host}:${this.ddpSettings.port}${path}`;

        return url;
    }

    private _getNextId() {
        return (this._nextId += 1).toString();
    }

    private _endPendingMethodCalls() {

        const ids:any = _.keys(this._pendingMethods);
        this._pendingMethods = {};

        ids.forEach((id:any) => {
            if (this._callbacks[id]) {
                this._callbacks[id](new Error('DDPClient: Disconnected from DDP server'));
                // delete this._callbacks[id];
            }

            if (this._updatedCallbacks[id]) {
                this._updatedCallbacks[id]();
                // delete this._updatedCallbacks[id];
            }
        });
    }

}
