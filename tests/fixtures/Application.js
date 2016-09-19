'use strict';

import JClass from '../../lib/JClass';
import JList from '../../lib/JList';

/**
 * <!-- begin-user-doc -->
 * <!-- end-user-doc -->
 */
const instanceName = 'Application';

export default class Application extends JClass{
	constructor(opts) {
		super(opts);

		// Stores the meta infomation for each property
		this._property_types = {
			'app_id'        : 'string',
			'name'          : 'string',
			'description'   : 'string',
			'creation_date' : 'date'
		};

		// stores the metainformation for the reference types
		this._reference_type = {
			'entitlements' : {
				'containment' : true,
				'unique'      : true,
				'upper_bound' : -1,
				'type'        : 'Entitlement'
			},
			'otherList' : {
				'containment' : true,
				'unique'      : true,
				'upper_bound' : -1,
				'type'        : 'Entitlement'
			}
		};


		/* ------------------------
		 * normal Properties
		 * ------------------------
		 */

 		// <no desc>
		this._app_id        = undefined;

		// <no desc>
		this._name          = undefined;

		// <no desc>
		this._description   = undefined;

		// <no desc>
		this._creation_date = undefined;

		/* ------------------------
		 * references
		 * ------------------------
		 */

		 // <no desc>
		 this._entitlements = new JList({
			'container'         : this,
 			'property_name'     : 'entitlements',
 			'unique'            : true,
 			'upper_bound'       : -1,
 			'containment'       : true,
 			'model'             : this._model,
 			'type'              : 'Entitlement'
 		});

		this._otherList = new JList({
		 'container'         : this,
		 'property_name'     : 'otherList',
		 'unique'            : true,
		 'upper_bound'       : -1,
		 'containment'       : true,
		 'model'             : this._model,
		 'type'              : 'Entitlement'
	 });
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
	get appId(){
		return this._app_id;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	set appId(app_id){
		return this._app_id = app_id;
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

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	get creationDate(){
		return this._creation_date;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	set creationDate(creation_date){
		return this._creation_date = creation_date;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	get entitlements(){
		return this._entitlements;
	}

	/**
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	get otherList(){
		return this._otherList;
	}


}
