'use strict';

import path from 'path';
import assert from 'assert';
import fs from 'fs';
import mkdirp from 'mkdirp';


import DataEventHandler from '../lib/DataEventHandler';
import { Logger } from 'jmf';
import { ModelParser } from 'jmf';


const targetDir = path.join(__dirname, './volatile');
mkdirp(targetDir);

const logger = new Logger();

// -------------------------------
// Common
// -------------------------------
const metaModelFile = path.join(__dirname, './fixtures/demo_model.json');
const metaModelContent = fs.readFileSync(metaModelFile);
const metaModel = JSON.parse(metaModelContent);

// -------------------------------
// Run
// -------------------------------
const eventhandler = new DataEventHandler({ logger: logger });
const options = {
  //"event_handler": [eventHandlerGraphQl,eventHandlerTdgImport, eventHandlerTdgExport]
  "event_handler": [eventhandler]
};

const modelParser = new ModelParser(options);
modelParser.parse(metaModel);
modelParser.printErrors();


// describe('Data Eventhandler Tests', () => {
//   it("Test the instance name", () => {
//     const eventhandler = new DataEventHandler({ logger: logger });
//     //assert.equal(name, 'Application');
//   });
// });
