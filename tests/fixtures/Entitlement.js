'use strict';

import JClass from '../../lib/JClass';

/**
 * Demo class used for the tests
 */

const instanceName = 'Entitlement';

export default class Entitlement extends JClass{
	constructor(opts) {
		super(opts);

		// Stores the meta infomation for each property
		this._property_types = {
			'name'          : 'string',
			'description'   : 'string'
		};

		// The ID for this entitlement per application
		this._name = undefined;

		// <no desc>
		this._description = undefined;
	}

	static getInstanceName(){
		return instanceName;
	}

	get instanceName(){
		return instanceName;
	}

	set instanceName(name){
		throw new Error('The instance name could not be changed');
	}


	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	get name(){
		return this._name;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	set name(name){
		return this._name = name;
	}


	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	get description(){
		return this._description;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	set description(description){
		return this._description = description;
	}

}
