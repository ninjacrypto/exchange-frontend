import { websocketUrl } from 'setup';
import { isArray, isString, startsWith } from 'lodash';
import { store } from 'redux/store';

export default class WebSocketConnection {
  constructor() {
    this.afterStart = [];
    this.subscriptions = {};
    this.eventHandlers = {};
    this.initialize();

    this.lastTs = new Date().getTime();
    this.tradingPair = '';
  }

  initialize() {
    // console.log('initialize');
    this.connection = new WebSocket(websocketUrl);

    this.connection.onmessage = this.handleMessage;
    this.connection.onopen = this.handleConnect;
    this.connection.onclose = this.handlDisconnect;
    this.connection.onerror = this.handlError;
  }

  init_reauth() {
    this.subscribe('MK');
    this.subscribe(
      'CH',
      this.tradingPair
    );
    if (store)
    {
      const { auth: { authorization } } = store.getState();
      if (authorization) {
        this.login(authorization);
      }
    }
  }

  getLastTS = () => {
    return this.lastTs;
  }

  handleConnect = event => {
    // console.log('handleConnect');
    this.subscribe('MK');
    this.afterStarted();
  };

  handlDisconnect = event => {
    // console.log('handlDisconnect');
    setTimeout(() => {
      this.initialize();
      this.init_reauth();
    }, 5000);
  }

  handlError = event => {
    // console.log('handlError');
  }

  handleMessage = rawData => {
    const data = JSON.parse(rawData?.data);

    if (data) {
      const event = data?.event;
      // if (data.method === 'subscribe') {
      //   if (data.events && data.events[0].event.toString().startsWith("PO") && data.events[0].message=="Subscribed.") {
      //     console.log('ddddddd', data);
      //     store.getState().orders.openOrders = [];
      //   }
      // }

      if (event) {
        if (Array.isArray(this.tradingPair)) {
          if (data.event.includes(".")) {
              if (data.event.split('.')[1] !== this.tradingPair[0]) {
                // this.unsubscribe('PO', [data.event.split('.')[1]]);
                return;
              }
          }
        } else {
          if (data.event.includes(".")) {
              if (data.event.split('.')[1] !== this.tradingPair) {
                // this.unsubscribe('PO', [data.event.split('.')[1]]);
                return;
              }
          }
        }

        const [eventName] = event.split('.');
        const method = this.eventHandlers?.[eventName];

        if (method) {
          method(data?.data);
        }

        if (data?.event == "MK") {
          this.lastTs = new Date().getTime();
        }

        if (data.method === 'subscribe' && data.event && data.event[0].event == "BL" && data.event[0].message=="Access denied.") {
          const { auth: { authorization } } = store.getState();
          if (authorization) {
            this.login(authorization);
          }
        }
    }
  }
};

  afterStarted = () => {
    // Sometimes an invoke will be called before the connection has initialized
    // `afterStart` collects functions to run and runs them on initialization
    if (this.afterStart.length) {
      this.afterStart.forEach(singleFn => singleFn());
      this.afterStart = [];
    }
  };

  getEventsWithChannels = (events, channels) => {
    let initialEvents = isArray(events) ? events : [events];
    if (!channels) {
      return initialEvents;
    }

    const channelString = isArray(channels) ? channels.join('.') : channels;

    const updatedEvents = initialEvents.map(singleEvent => `${singleEvent}.${channelString}`);

    return updatedEvents;
  }

  subscribe = (events, channels) => {
    if (channels !== undefined) {
      this.tradingPair = channels;
    }

    this.send({
      method: 'subscribe',
      events: this.getEventsWithChannels(events, channels),
    });
  }

  unsubscribe(events, channels) {
    this.send({
      method: 'unsubscribe',
      events: this.getEventsWithChannels(events, channels),
    });
  }

  login(token) {
    this.send({
      method: 'login',
      token,
    });
    this.unsubscribe('BL');
    this.subscribe('BL');
  }

  logout() {
    this.send({
      method: 'logout',
    });
  }

  send(message) {
    const messageToSend = isString(message) ? message : JSON.stringify(message);
    
    if (this.connection.readyState === 1) {
      return this.connection.send(messageToSend);
    }

    this.afterStart = [
      ...this.afterStart,
      () => {
        this.send(message);
      },
    ];
  }

  on = (eventName, callback) => {
    this.eventHandlers[eventName] = callback;
  };

  off = eventName => {
    delete this.eventHandlers[eventName];
  };
}

// export const socket = new WebSocketConnection();

// window.socket = socket;