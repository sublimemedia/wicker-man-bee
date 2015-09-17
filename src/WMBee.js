'use strict';

import Promise from 'bluebird';

export default class WMBee {
  constructor() {
    this.attached = [];
  }

  set(val) {
    this.attached
    .forEach(bee => {
      if (bee.next && typeof bee.next === 'function') {
        const nextVal = bee.next(val);

        if (!bee.halt) {
          bee.set(nextVal);
        } else if (typeof bee.halt === 'number') {
          setTimeout(bee.set.bind(bee, val), bee.halt);
        }
      }
    });
  }

  filter(callback) {
    const bee = new WMBee();

    bee.next = val => {
      bee.halt = true;

      if (typeof callback === 'function') {
        bee.halt = !(callback(val));
      }

      return val;
    };

    this.attached.push(bee);

    return bee;
  }

  map(callback) {
    const bee = new WMBee();

    bee.next = val => {
      let mappedVal = val;

      if (typeof callback === 'function') {
        mappedVal = callback(val);
      } else {
        // TODO: Warn map called without callback
      }

      return mappedVal;
    }

    this.attached.push(bee);

    return bee;
  }

  onValue(callback) {
    const bee = new WMBee();

    bee.next = val => {
      if (typeof callback === 'function') {
        callback(val);
      } else {
        // TODO: warn in debug
      }

      return val;
    };

    this.attached.push(bee);

    return bee;
  }

  delay(pause) {
    const bee = new WMBee();

    bee.next = val => val;

    if (typeof pause === 'number') {
      bee.halt = pause;
    } else {
      //TODO: warn in debug
    }

    this.attached.push(bee);

    return bee;
  }

  toPromise() {
    const bee = new WMBee(),
      promise = new Promise(function(resolve) {
        bee.next = resolve;
      });

   this.attached.push(bee);

   return promise;
  }
   
  unique() {
    const bee = new WMBee();
    bee.ignore = [];

    bee.next = val => {
      bee.halt = ~bee.ignore.indexOf(val);

      if (!bee.halt) {
        bee.ignore.push(val);
      }

      return val;
    }

    this.attached.push(bee);

    return bee;
  } 
 
}
