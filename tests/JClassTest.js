'use strict';

import assert from 'assert';

import Application from './fixtures/Application';
import Entitlement from './fixtures/Entitlement';
import JModel from '../lib/JModel';



describe('Common Class Tests', () => {
  it("Test the instance name", () => {
    const name = Application.getInstanceName();
    assert.equal(name, 'Application');
  });

  it("Set all attributes", () => {
    const model = new JModel();
    const a1 = new Application({ 'model': model });
    const values = {
      'app_id': 'Hugo 01',
      'name': 'Best Application',
      'description': 'What should I say?',
      'unknown': 'Do not store this'
    };

    const idBefore = a1.id;
    a1.setAllAttributes(values);

    assert.equal(a1.app_id, 'Hugo 01', "Attribute not stored corectly");
    assert.equal(a1.name, 'Best Application', "Attribute not stored corectly");
    assert.equal(a1.description, 'What should I say?', "Attribute not stored corectly");
    assert.equal(a1.unknown, undefined, "Attribute not stored corectly");
    assert.equal(a1.id, idBefore, "The ID must not change");
  });

  it("Set all attributes with ID. ID lower than current sequence", () => {
    const model = new JModel();
    const a1 = new Application({ 'model': model });
    const values = {
      'app_id': 'Hugo 01',
      'name': 'Best Application',
      'description': 'What should I say?',
      '_id': '150',
      'unknown': 'Do not store this'
    };

    const idBefore = a1.id;
    a1.setAllAttributes(values);

    assert.equal(a1.app_id, 'Hugo 01', "Attribute not stored corectly");
    assert.equal(a1.name, 'Best Application', "Attribute not stored corectly");
    assert.equal(a1.description, 'What should I say?', "Attribute not stored corectly");
    assert.equal(a1.unknown, undefined, "Attribute not stored corectly");
    assert.equal(a1.id, idBefore, "The ID must not change");
  });

  describe('Hash tests', () => {
    const m = new JModel();
    m.registerClass(Entitlement);
    m.registerClass(Application);

    const values = {
      'app_id': 'Hugo 01',
      'name': 'Best Application',
      'description': 'What should I say?',
      'unknown': 'Do not store this'
    };

    const values2 = {
      'app_id': 'Hugo 02',
      'name': 'Best Application',
      'description': 'What should I say?',
      'unknown': 'Do not store this'
    };


    const a1 = m.createObject('Application', values);
    const a2 = m.createObject('Application', values);
    const a3 = m.createObject('Application', values2);
    const a4 = m.createObject('Application', values);
    const a5 = m.createObject('Application', values);
    const a6 = m.createObject('Application', values);

    const e1 = m.createObject('Entitlement', { 'name': 'Ent 1', 'description': 'Desc 1' });
    const e2 = m.createObject('Entitlement', { 'name': 'Ent 2', 'description': 'Desc 2' });
    const e3 = m.createObject('Entitlement', { 'name': 'Ent 3', 'description': 'Desc 3' });

    const e1_a = m.createObject('Entitlement', { 'name': 'Ent 1', 'description': 'Desc 1' });
    const e2_a = m.createObject('Entitlement', { 'name': 'Ent 2', 'description': 'Desc 2' });

    a1.entitlements.add(e1);
    a1.entitlements.add(e2);
    a1.entitlements.add(e3);

    a2.entitlements.add(e1);
    a2.entitlements.add(e2);
    a2.entitlements.add(e3);

    a3.entitlements.add(e1);
    a3.entitlements.add(e2);
    a3.entitlements.add(e3);

    a4.otherList.add(e1);
    a4.otherList.add(e2);
    a4.otherList.add(e3);

    a5.entitlements.add(e1);
    a5.entitlements.add(e3); // other order
    a5.entitlements.add(e2);

    it("two different objects but the same values", () => {
      assert.equal(a1.getHash(), a2.getHash());
    });

    it("two different objects same refe but different attributes", () => {
      assert.notStrictEqual(a1.getHash(), a3.getHash());
    });

    it("two different objects same attr same entitlements in different references", () => {
      assert.notStrictEqual(a1.getHash(), a4.getHash());
    });

    it("two different objects same attr same entitlements in different order", () => {
      assert.notStrictEqual(a1.getHash(), a5.getHash());
    });


  });


});
