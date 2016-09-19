'use strict';

const md5 = require('md5');

import { EventEmitter } from 'events';

/**
 * This class implements a list which could be parametrized. The list is a single value, an array or a set
 * depending on the parameter. Also it uses callbacks to notify about changes.
 * Internally the list will not store the object itself, it stores only the ID of the object.
 *
 * The following object describes the possible parameter and its default values
 * {
 *  property_name : <The name of this property>
 *	unique        : true
 *  upper_bound   : -1
 *  containment   : false
 * }
 *
 * container         - (mandatory) The object containing this list
 * property_name     - (mandatory) The name of the property this list is used for.
 * unique            - If true, an element could only be stored once.
 * upper_bound       - '-1,0' means that there is no limit
 *                     '1' means that only one value coul be stored. In this case it is more or less just an attribute
 *                     'n' defines how many elemenst the list can store
 * containment       - A true value means that the referenced element only exists in this reference. If it is deleted from
 *                     here, the element itself must be deleted
 * model.getObjectForId - The function to get the ID for an object
 * type              - The class of the elements, which could stored in this list
 *
 *
 * This class is an event emitter and emits the following events:
 * didAdd
 *	property_name	- The name of the reference
 *	element       - The element added
 * didRemove
 *	property_name	- The name of the reference
 *	element       - The element removed
 * limitReached
 *                - Emit if the upper bound for this list will be execeeded by adding a new value
 *	property_name	- The name of the reference
 *	element       - The element which should have been added
 *  limit         - The limit which is reached
 */
export default class JList extends EventEmitter {

  constructor(opts) {
    super();

    if (opts === undefined) {
      throw new Error(`No configuration options given`);
    }

    if (opts.container === undefined) {
      throw new Error(`No container option given`);
    }
    if (opts.property_name === undefined) {
      throw new Error(`No property_name option given`);
    }

    if (opts.model === undefined) {
      throw new Error(`No model given`);
    }

    if (opts.type === undefined) {
      throw new Error(`No type given`);
    }

    this.container = opts.container;
    this.property_name = opts.property_name;
    this.model = opts.model;
    this.type = opts.type;
    this.unique = true;
    this.upper_bound = -1;
    this.containment = false;

    if (opts.unique !== undefined) {
      this.unique = opts.unique;
    }

    if (opts.upper_bound !== undefined) {
      this.upper_bound = opts.upper_bound;
    }

    if (opts.containment !== undefined) {
      this.containment = opts.containment;
    }

    // creates the needed properties
    this.clear();
  }

  /**
   * Returns the hash value of this list
   * @returns {number} The claculated hashValue as number
   */
  getHashValue() {
    // FIXME Problems if cyclic references. Needs to be fixed
    // TODO
    let value = 0;
    this.forEach(obj => {
      value += obj.getHashValue();
    });

    // convert the value to a string
    const stringVal = value.toString(16);

    let nameVal;
    if (value === 0) {
      nameVal = 'Empty';
    } else {
      nameVal = md5(this.property_name);
    }

    const listMd5 = md5(nameVal + stringVal);
    const res = parseInt(listMd5, 16);
    return res;
  }

  _emitAdd(element) {
    this.emit('didAdd', this.property_name, element);
  }

  _emitRemove(element) {
    this.emit('didRemove', this.property_name, element);
  }

  _emitLimitReached(elements) {
    this.emit('limitReached', this.property_name, elements, this.upper_bound);
  }

  /**
   * If an element is added or removed some
   */
  _handleAdd(element) {
    if (this.containment) {
      // set the parent
      element._setParent(this.property_name, this.container);
    } else {
      // need to add it to the referenced items list
      element._addOpositeReference(this.property_name, this.container);
    }
  }

  _handleRemove(element) {
    if (this.containment) {
      // need to delete the parent
      element._setParent(this.property_name, undefined);
    } else {
      // need to remove the oposite reference
      element._removeOpositeReference(this.property_name, this.container);
    }
  }

  /**
   * Internal helper method. It will return the real object. If the if is given
   * it will retrive the original object for the ID first. Then it will proof
   * that the object is of the given type.
   * @param {object} element - The element or element id to be prooved.
   * @returns {object} The real object if it could be found
   */
  _getElementForObject(element) {
    if (element === undefined) {
      throw new Error(`The given element is 'undefined'`);
    }

    // The given element is an id, check that it reference a valid object
    if (typeof element === 'number') {
      // eslint-disable-next-line no-param-reassign
      element = this.model.getObjectForId(element);
    }

    const expectedClass = this.model.getClassForName(this.type);
    // Check that the element if of the expected type
    if (expectedClass !== undefined && !(element instanceof expectedClass)) {
      throw new Error(`The element '${element.instanceName}' if not an instance of '${expectedClass.instanceName}'`);
    }

    return element;
  }

  /**
   * Returns a boolean value indicating if this list contains the given element or not
   * @param {object} element - The element to be searched in the list
   * @returns {boolean} True if the element exists in the list
   */
  has(element) {
    // check the given value and also proof the type.
    // Than make the element to an ID
    // eslint-disable-next-line no-param-reassign
    element = this._getElementForObject(element)._id;

    if (this.data === undefined) {
      return false;
    }

    if (this.upper_bound === 1) {
      // it will only store one element
      if (this.data === element) {
        return true;
      }
    } else if (this.unique) {
      return this.data.has(element);
    } else {
      const index = this.data.indexOf(element);
      if (index >= 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns the ammount of stored elements
   * @returns {number} The size of the stored elements
   */
  size() {
    if (this.data === undefined) {
      return 0;
    } else if (this.upper_bound === 1) {
      // it will only store one element
      return 1;
    } else if (this.unique) {
      return this.data.size;
    }
    return this.data.length;
  }

  /**
   * Adds a new element
   * @param {object} element - The element to be added
   */
  add(element) {
    if (element === undefined) {
      throw new Error('Element must be defined');
    }

    // check the given value and also proof the type.
    // Than make the element to an ID
    const elementId = this._getElementForObject(element)._id;

    if (this.upper_bound === 1) {
      if (this.data !== undefined) {
        const oldElement = this.data;
        this.data = undefined;
        this._emitRemove(oldElement);
      }
      this.data = elementId;
      this._emitAdd(element);
    } else if (this.unique) {
      if (!this.data.has(element)) {
        if (this.upper_bound === this.size()) {
          // The limit is already reached, could not add a new element
          this._emitLimitReached(element);
        } else {
          this.data.add(elementId);
          this._emitAdd(element);
        }
      }
    } else {
      this.data.push(elementId);
      this._emitAdd(element);
    }
    this._handleAdd(element);
  }

  /**
   * Removes the given element from the list if it exists.
   * If the list is not unique it will remove the last one.
   * @param {object} element - The element to be removed
   */
  remove(element) {
    // check the given value and also proof the type.
    // Than make the element to an ID
    // eslint-disable-next-line no-param-reassign
    element = this._getElementForObject(element)._id;

    if (this.upper_bound === 1) {
      // it will only store one element
      if (this.data !== undefined) {
        if (this.data === element) {
          this.data = undefined;
          this._emitRemove(element);
        }
      }
    } else if (this.unique) {
      if (this.data.has(element)) {
        this.data.delete(element);
        this._emitRemove(element);
      }
    } else {
      // first find the last element
      let index = -1;
      let lastIndex = this.data.indexOf(element);
      do {
        if (index > lastIndex) {
          lastIndex = index;
        }
        index = this.data.indexOf(element, lastIndex);
      } while (index > lastIndex);

      // remove the last element
      this.data.splice(lastIndex, 0);
      this._emitRemove(element);
    }
  }

  /**
   * The forEach() method executes a provided function once per each value in the Set object, in insertion order.
   * @param {function} callback - Function to execute for each element.
   */
  forEach(callback) {
    if (this.upper_bound === 1) {
      // it will only store one element
      if (this.data !== undefined) {
        const element = this.model.getObjectForId(this.data);
        return callback(element, 0, [element]);
      }
    } else {
      let i = 0;
      if (this.data !== undefined) {
        this.data.forEach(id => {
          const element = this.model.getObjectForId(id);
          // This is wrong, normaly the second array contains always all the elements
          // eslint-disable-next-line callback-return
          callback(element, i, [element]);
          i++;
        });
      }
    }
  }

  /**
   * clears the list of stored elements
   */
  clear() {
    if (this.upper_bound === 1) {
      // it will only store one element
      if (this.data !== undefined) {
        const oldElement = this.data;
        this.data = undefined;
        this._handleRemove(oldElement);
      }
    } else if (this.unique) {
      if (this.data === undefined) {
        this.data = new Set();
      } else if (this.data.size() > 0) {
        const oldElements = [];
        this.data.forEach(val => {
          this._handleRemove(val);
          oldElements.push(val);
        });
        this.data = new Set();
      }
    } else if (this.data !== undefined) {
      this.data = [];
    } else {
      const oldElements = this.data;
      oldElements.forEach(val => {
        this._handleRemove(val);
      });
      this.data = [];
    }
  }

}
