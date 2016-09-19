'use strict';

import fs from 'fs';

import mkdirp from 'mkdirp';
import path from 'path';
// import pluralize from 'pluralize';
import changeCase from 'change-case';

const SPACE = ' ';

/**
 * Creates the object files. For each object one file will be created in the export directory
 */

/**
 * The base Model parser
 * Parses the model and calls eventhandler
 */
export default class DataExporter {

  constructor(opts) {
    if (!opts) {
      // eslint-disable-next-line no-param-reassign
      opts = {};
    }

    if (opts.annotation !== undefined) {
      this.annotation = opts.annotation;
    } else {
      this.annotation = 'data';
    }


    if (opts.file_template_class === undefined) {
      throw new Error('No template file name given');
    } else {
      this.file_template_class = opts.file_template_class;
    }

    // you could define your own logger in th config
    if (opts.logger) {
      this.logger = opts.logger;
    } else {
      throw new Error("No logger defined in constructor of 'EventHandler '");
    }

    if (opts.export_dir === undefined) {
      throw new Error('No export directory "export_dir" name given');
    } else {
      this.export_dir = opts.export_dir;
    }

    // Stores the generated class strings by there name
    // definition->objectName.attributes.attributeName = attributeCreationString
    // definition->objectName.string = objectCreationString
    // definition->objectName.connection = connectionToThisObject
    // definition->objectName.dependencies = [objName1, ..n]
    // definition->objectName.name_class = className
    // definition->objectName.name_type = typeName
    this.definition = {};

    // stores the object dependencies.
    // On the root level are all the objects without dependencies.
    // dependencies.[source] = [targets]
    this.dependencies = {};
    this.rootObjects = [];
  }

  /**
   * Writes the model as defined by this exporter.
   * The model has the format as created by the appropriate event handler
   * @public
   * @param {object} model - The model to be exported
   */
  write(model) {
    const exportDir = this.export_dir;
    mkdirp.sync(exportDir);

    // eslint-disable-next-line no-sync
    const templateClassFileContent = fs.readFileSync(this.file_template_class, {
      encoding: 'utf-8'
    });

    Object.keys(model).forEach(objectName => {
      const fileName = path.join(exportDir, this._getClassName(objectName) + '.js');
      this.logger.info(`Write data file '${fileName}'`);

      // Store the object name in the sub model
      model[objectName].name = objectName;
      const fileContent = this._buildFile(model[objectName], templateClassFileContent);

      // eslint-disable-next-line no-sync
      fs.writeFileSync(fileName, fileContent);
    });


  }

  /**
   * Builds the schema.js content from the model and the template fil
   * @protected
   * @param {object} model - The model to be exported
   * @param {string} templateFileContent - The template file content read from the template file
   * @returns {string} The file content which was build
   */
  _buildFile(model, templateFileContent) {
    let content = templateFileContent;
    content = content.replace(/__INSTANCE_NAME__/g, this._getClassName(model.name));


    content = content.replace(/__PROPERTIES_TYPES__/, this._buildPropertyTypes(model));
    // content = content.replace(/__REFERENCE_TYPES__/, this._buildRefereceTypes(model));
    //
    // content = content.replace(/__PROPERTIES_DEFINITION__/, this._buildPropertyDefinitions(model));
    // content = content.replace(/__REFERENCE_DEFINITION__/, this._buildRefereceDefinitions(model));
    //
    // content = content.replace(/__GETTER_SETTER_ATTRIBUTES__/, this._buildGetterSetterAttributes(model));
    // content = content.replace(/__GETTER_REFERENCES__/, this._buildGetterReferences(model));


    return content;
  }

  /**
   * Creates the property type definitions of a class
   * @protected
   * @param {object} model - The sub model to be exported. The model of one class
   * @returns {string} The string used to replace the placeholder in the template
   */
  _buildPropertyTypes(model) {
    const attributes = [];
    let maxLength = 0;

    Object.keys(model.attributes).forEach(attrName => {
      if (attrName.length > maxLength) {
        maxLength = attrName.length;
      }
    });

    Object.keys(model.attributes).forEach(attrName => {
      const spaces = SPACE.repeat(maxLength - attrName.length);
      const type = model.attributes[attrName].type;
      attributes.push(`${attrName} ${spaces}: '${type}'`);
    });

    return attributes.join(`,\n      `);
  }




  /**
   * Creates the class name for an objectName
   * @protected
   * @param {string} objectName - The name of the object to build the fields for
   * @returns {string} The created class name
   */
  _getClassName(objectName) {
    return changeCase.pascalCase(objectName);
  }

}
