'use strict';

import JClass from './JClass';

/**
 * The JModel is a registry for all the created objects.
 * It also works as the factory for creating the objects
 */

export default class JModel {
  constructor(opts) {
    if (opts === undefined) {
      // eslint-disable-next-line no-param-reassign
      opts = {};
    }

    // The name of this model
    this.name = 'undefined model';
    if (opts.name) { this.name = opts.name; }

    // stores the classes by there name
    this._class_registry = {};

    // stores all the created objects by there id
    this._object_registry = {};

    // initial value
    this._sequence = 1000;
  }

  /**
   * Creates a new sequence number
   * @returns {number} A new sequence number
   */
  get sequence() {
    return this._sequence++;
  }

  /**
   * Set a new sequence value. But only change the current sequence if the given
   * value is greater than the current value
   * @param {number} newValue - The new sequence value
   */
  set sequence(newValue) {
    if (newValue > this._sequence) {
      this._sequence = newValue;
      this._sequence++;
    }
  }

  /**
   * Registers a new class. So it could be created by this factory
   * @param {object} clazz - The class to be registered
   * @param {string} className - (Optional) The name under the class should
   *                             be registered. If not given the real classname is used
   */
  registerClass(clazz, className) {

    if (typeof clazz !== 'function') {
      throw new Error(`The given class ist not a function`);
    }

    if (!clazz instanceof JClass) {
      throw new Error(`Only classes which are an instance of 'JClass' could be registered`);
    }

    // ok, register the class
    if (className === undefined) {
      // eslint-disable-next-line no-param-reassign
      className = clazz.getInstanceName();
    }

    this._class_registry[className] = clazz;
  }

  /**
   * Returns the class which is registered under the given name
   * @param {string} className - The name under which the class is registered
   * @returns {function} The class
   */
  getClassForName(className) {
    if (this._class_registry[className] === undefined) {
      throw new Error(`There is no class registered under the name '${className}'`);
    }
    return this._class_registry[className];
  }

  /**
   * Registers an object in this model
   * @param {object} element - The object to be registered
   */
  registerObject(element) {
    let id = element.id;
    if (id === undefined) {
      id = this.sequence;
      element.id = id;
    }

    // maybe the sequence must be set to a new value
    this.sequence = id;

    this._object_registry[id] = element;
  }

  /**
   * Returns the object IDs of all the registered objects
   * @Returns {array} The list of IDs
   */
  getAllObjectIds() {
    return Object.keys(this._object_registry);
  }

  /**
   * Returns the object with the given ID. If the object does not exists
   * an error will be thrown
   * @param {number} id - The id of the object to be returned
   */
  getObjectForId(id) {
    if (id === undefined) {
      throw new Error(`The given ID must not 'undefined'`);
    }

    if (typeof id === 'string') {
      // try to convert into number
      // eslint-disable-next-line no-param-reassign
      id = parseInt(id, 10);
    }

    if (typeof id !== 'number') {
      throw new Error(`The given ID must be of type 'number' not '${typeof id}'`);
    }

    if (this._object_registry[id] === undefined) {
      throw new Error(`The object with the id '${id}' does not exists in the model ${this.name}`);
    }
    return this._object_registry[id];
  }

  /**
   * Creates a new object of the given class type and register it at the model
   * @param {string} className  -  The name of the class, the object should be created from
   * @param {object} attributes -  (Optional) The attributes to set for this object
   * @param {object} options    -  (Optional) The options used for the constructor of the class
   * @returns {object} The created object
   */
  createObject(className, attributes, options) {
    const clazz = this._class_registry[className];

    if (clazz === undefined) {
      throw new Error(`Under the name '${className}' is no class registered`);
    }

    if (options === undefined) {
      // eslint-disable-next-line no-param-reassign
      options = {};
    }

    options.model = this;

    const newObject = new clazz(options);
    if (attributes) {
      newObject.setAllAttributes(attributes);
    }

    this.registerObject(newObject);

    return newObject;
  }

}
