'use strict';

const md5 = require('md5');

export default class JClass {

  /**
   * The only supported option is the '_id' attribute
   * opts = {
   *		'id'    : 134
   *		'model' : modelFactory
   * }
   */
  constructor(opts) {
    if (opts === undefined) {
      throw new Error('No options given');
    }

    if (opts.model === undefined) {
      throw new Error('No model given');
    }

    this._model = opts.model;

    // Stores the meta information for each property
    this._property_types = {};

    // stores the meta information for the reference types
    this._reference_type = {};

    // if this object is contained, this stores the parent object
    // _parent.object = $object
    // _parent.property_name = $propertyName // the name of the reference
    this._parent = undefined;

    // stores the IDs of all the objects, which references this object.
    // This infomation is needed when this object is deleted.
    // Format:
    // _referenced_by.$objectId.$propertyName = $count;
    this._referenced_by = {};

    if (opts.id !== undefined) {
      this._id = opts.id;
    } else {
      this._id = undefined;
    }
  }

  /**
   * Returns the internal sequence id
   * @returns {number} The internal sequence id of this object
   */
  get id() {
    return this._id;
  }

  /**
   * Sets the internal id of this object. This is only possible once. After the id is set
   * it could not be changed any more
   * @param {number} id - The idd to be set
   */
  set id(id) {
    if (this._id === undefined) {
      this._id = id;
    } else {
      throw new Error('An id could not be set to a new value');
    }
  }

  /**
   * Creates the MD5 hash for this object
   * @returns {string} The hash value as string
   */
  getHash() {
    // FIXME Problems if cyclic references. Needs to be fixed
    return this.getHashValue().toString(16);
  }

  /**
   * Creates the MD5 hash for this object
   * @returns {number} The hash value as number
   */
  getHashValue() {
    // FIXME Problems if cyclic references. Needs to be fixed
    let hashValue = 0;

    // create the hash for all the attributes
    Object.keys(this._property_types).forEach(attrName => {
      const attrValue = this[attrName];
      if (attrValue !== undefined) {
        const hashString = md5(this[attrName]);
        const myInt = parseInt(hashString, 16);
        hashValue += myInt;
      }
    });

    // create the has for all the references
    Object.keys(this._reference_type).forEach(attrName => {
      const list = this[attrName];
      hashValue += list.getHashValue();
    });

    return hashValue;
  }

  /**
   * Set all the given attributes in one go.
   * Only the attributes defined for this class will be set
   * @param {object} attributeValues - The attributes values to set
   */
  setAllAttributes(attributeValues) {
    Object.keys(attributeValues).forEach(attrName => {
      // only set the attribute value if this attribute is defined
      if (this._property_types[attrName] !== undefined) {
        this[attrName] = attributeValues[attrName];
      }
    });
  }

  /**
   * Set a new parent for this object
   * @param {string} propertyName - The name of the reference this object was added to
   * @param {object} object - The object this object was added to a reference. If the new object is undefined
   *                          It means that the parent should be deleted
   */
  _setParent(propertyName, newParent) {
    // First remove this object from it previos parent
    this._removeFromParent(propertyName);

    if (newParent !== undefined) {
      // Second set the new parent for this object
      if (this._parent === undefined) {
        this._parent = {};
      }
      this._parent.property_name = propertyName;
      this._parent.object = newParent;
    }
  }

  /**
   * Returns the parent of this object. An parent only exists if this object
   * is a conained object.
   * @returns {object} The parent of this object
   */
  _getParent() {
    if (this._parent !== undefined) {
      return this._parent.object;
    }
    return undefined;
  }

  /**
   * Removes this object from its parent, if it has one
   * @param {string} propertyName - The name of the reference this object was added to
   */
  _removeFromParent(propertyName) {
    if (this._parent !== undefined && this._parent.object !== undefined) {
      // first this object must be removed from the old parent
      const oldParent = this._parent.object;
      const listObj = oldParent[propertyName];

      listObj.remove(this);
    }
  }

  /**
   * Add a reference for this object. If this object is added to an other object, the other object references this.
   * This stores the oposite of a normal attribute.
   * @param {string} propertyName - The name of the reference this object was added to
   * @param {object} sourceElement - The element this object was added.
   */
  _addOpositeReference(propertyName, sourceElement) {
    const objId = sourceElement.id;
    if (this._referenced_by[objId] === undefined) {
      this._referenced_by[objId] = {};
      this._referenced_by[objId][propertyName] = 1;
    } else if (this._referenced_by[objId][propertyName] === undefined) { // this object is already referenced
      this._referenced_by[objId][propertyName] = 1;
    } else {
      // this object is already referenced from the same property
      this._referenced_by[objId][propertyName]++;
    }
  }


  /**
   * Referenced objects store all the incomming references to this object.
   * This method will remove an object from this references.
   * @param {string} propertyName - The name of the reference this object was added to
   * @param {object} sourceElement - The object to be deleted from the incomming references
   */
  _removeOpositeReference(propertyName, sourceElement) {
    const objId = sourceElement.id;

    if (this._referenced_by[objId] === undefined) {
      // TODO The JClass needs a toString method to get a name
      throw new Error(`The object could not be deleted from this object as it does not exists`);
    }
    if (this._referenced_by[objId][propertyName] === undefined) {
      // TODO The JClass needs a toString method to get a name
      throw new Error(`The object could not be deleted from this object at the given property as it does not exists`);
    }

    if (this._referenced_by[objId][propertyName] > 1) {
      // just decrement the counter
      this._referenced_by[objId][propertyName]--;
    } else {
      // remove the whole element
      delete this._referenced_by[objId][propertyName];
      if (this._referenced_by[objId] === undefined) {
        // it was the last property, delete the complete object
        delete this._referenced_by[objId];
      }
    }
  }

}
