'use strict';

/* Controllers */

var fbAppControllers = angular.module('fbAppControllers', []);

fbAppControllers.controller('StartCtrl', ['$scope', '$routeParams', 'FbApp',
	function($scope, $routeParams, FbApp){
		//Check if user is logged in with Facebook.
		//If so, redirect to check
		//If not, wait till user clicks

		$scope.app_alias = $routeParams.alias;
	}]);

fbAppControllers.controller('CheckCtrl', ['$scope', '$routeParams', '$location', 'FbApp',
	function($scope, $routeParams, $location, FbApp){
		//Check if the user *can* install the app
		//If so, show them what's about to happen
		//Install the app and redirect to /success
		$scope.app_alias = $routeParams.alias;

		$scope.user = {
			full_name: "Place Holder",
			id: "100000669665846"
		};

		$scope.fbApp = FbApp.get({alias: $scope.app_alias}, function(fbApp){
			//TODO: with API
			$scope.fbApp = fbApp;
			$scope.fbApp.app_name = "Test app";
			$scope.fbApp.page_name = "Test page";
		});


		$scope.installApp = function(){
			$location.path("/success/" + $scope.app_alias)
		};

		$scope.cancel = function(){
			$location.path("/cancelled");
		};
	}]);

fbAppControllers.controller('SuccessCtrl', ['$scope', '$routeParams', 'FbApp',
	function($scope, $routeParams, FbApp){
		//Show success and redirect link
	}]);
