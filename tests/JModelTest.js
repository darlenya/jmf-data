'use strict';

import assert from 'assert';

import Application from './fixtures/Application';
import Entitlement from './fixtures/Entitlement';
import JModel from '../lib/JModel';

describe('Model constructor Tests', () => {
  it("Create Model", () => {
    const m1 = new JModel();
    assert.equal(m1.name, 'undefined model', 'Model with out a given name should have the undefined name');
  });

  it("Create Model with name", () => {
    const m1 = new JModel({ 'name': 'my model' });
    assert.equal(m1.name, 'my model');
  });
});



describe('Model Sequence Tests', () => {
  it("Sequence test", () => {
    const m1 = new JModel({ 'name': 'my model' });
    assert.equal(m1.name, 'my model');

    const val = m1.sequence;
    const val2 = m1.sequence;

    assert.equal(val + 1, val2);
  });

  it("Sequence test set value less than current", () => {
    const m1 = new JModel({ 'name': 'my model' });
    assert.equal(m1.name, 'my model');

    const val = m1.sequence;
    m1.sequence = 150;
    const val2 = m1.sequence;

    assert.equal(val + 1, val2);
  });

  it("Sequence test set value greater than current", () => {
    const m1 = new JModel({ 'name': 'my model' });
    assert.equal(m1.name, 'my model');

    const val = m1.sequence;
    m1.sequence = val + 10;
    const val2 = m1.sequence;

    assert.equal(val + 11, val2);
  });
});


describe('Model Registry Tests', () => {
  it("Add object to registry with id", () => {
    const m1 = new JModel({ 'name': 'my model' });
    const e1 = new Entitlement({ 'model': m1, 'id': 145 });
    assert.equal(e1.id, 145);

    m1.registerObject(e1);
    const e1Copy = m1.getObjectForId(145);
    assert.equal(e1Copy, e1);
  });

  it("Add object to registry without id", () => {
    const m1 = new JModel({ 'name': 'my model' });
    const e1 = new Entitlement({ 'model': m1 });

    m1.registerObject(e1);
    const e1Copy = m1.getObjectForId(e1.id);
    assert.equal(e1Copy, e1);
  });

});


describe('Model Create Object', () => {
  it("Let the model create the object", () => {
    const m = new JModel({ 'name': 'my model' });
    m.registerClass(Entitlement);
    m.registerClass(Application);
    m.registerClass(Application, 'Gumbo'); // Register the class Application under the name 'Gumbo'

    const seq = m.sequence;

    const e1 = m.createObject('Entitlement');
    const a1 = m.createObject('Application');
    const a2 = m.createObject('Gumbo');

    assert.equal(e1.id, seq + 1);
    assert.equal(a1.id, seq + 2);
    assert.equal(a2.id, seq + 3);

    assert.equal(e1.instanceName, 'Entitlement');
    assert.equal(a1.instanceName, 'Application');
    assert.equal(a2.instanceName, 'Application');
  });

  it("Test getAllObjectIds", () => {
    const m = new JModel({ 'name': 'my model' });
    m.registerClass(Entitlement);
    m.registerClass(Application);

    const seq = m.sequence;

    const e1 = m.createObject('Entitlement');
    const a1 = m.createObject('Application');
    const a2 = m.createObject('Application');

    const allIds = m.getAllObjectIds();

    assert.equal(allIds.length, 3);
    assert.equal(allIds[0], seq + 1);
    assert.equal(allIds[1], seq + 2);
    assert.equal(allIds[2], seq + 3);
  });



});
