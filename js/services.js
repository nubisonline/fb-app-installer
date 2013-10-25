'use strict';

/* Services */

var fbAppServices = angular.module('fbAppServices', ['ngResource']);

fbAppServices.factory('FbApp', ['$resource',
	function($resource){
		return $resource('res/app.json?alias=:alias', {}, {
			get: {method: 'GET'}
		});
	}]);
