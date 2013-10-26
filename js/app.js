'use strict';

/* App Module */

var fbAppInstaller = angular.module('fbAppInstaller', [
	'ngRoute',
	'fbAppControllers',
	'fbAppServices',
	'angularSpinner',
	'ezfb'
]);

fbAppInstaller.config(function($FBProvider){
	$FBProvider.setInitParams({
		appId: '619323064786371'
	});
})

fbAppInstaller.config(['$routeProvider',
	function($routeProvider){
		$routeProvider.
			when('/start/:alias', {
				templateUrl: 'partials/start.html',
				controller: 'StartCtrl'
			}).
			when('/check/:alias', {
				templateUrl: 'partials/check.html',
				controller: 'CheckCtrl'
			}).
			when('/success/:alias', {
				templateUrl: 'partials/success.html',
				controller: 'SuccessCtrl'
			}).
			when('/cancelled', {
				templateUrl: 'partials/cancelled.html'
			}).
			when('/notfound', {
				templateUrl: 'partials/none.html'
			}).
			otherwise({
				redirectTo: '/notfound'
			});
	}]);
