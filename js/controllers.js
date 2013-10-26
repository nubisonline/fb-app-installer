'use strict';

/* Controllers */

var fbAppControllers = angular.module('fbAppControllers', []);

fbAppControllers.controller('StartCtrl', ['$scope', '$routeParams', '$location', '$FB', 'FbApp',
	function($scope, $routeParams, $location, $FB, FbApp){
		$scope.app_alias = $routeParams.alias;
		$scope.inited = false;

		//Check if the requested alias exists
		FbApp.get({alias: $scope.app_alias}, function(fbApp){
			$scope.fbApp = fbApp;
			if(!fbApp.app_id){
				$location.path("/notfound");
			}
		});

		//Check if user is logged in with Facebook.
		//If so, redirect to check
		//If not, wait till user clicks
		updateLoginStatus(handleLogin);

		$scope.login = function(){
			$FB.login(function(res){
				if(res.authResponse){
					updateLoginStatus(handleLogin);
				}
			}, {scope: 'manage_pages'});
		};

		//Helper functions
		function updateLoginStatus(callback){
			$FB.getLoginStatus(function(res){
				$scope.loginStatus = res;

				(callback || angular.noop)();
			});
		}

		function handleLogin(){
			if($scope.loginStatus.status == "connected"){
				//Redirect to the next page if logged in
				$location.path("/check/" + $scope.app_alias);
			}else{
				//Show intro text and button if not logged in
				$scope.inited = true;
			}
		}
	}]);

fbAppControllers.controller('CheckCtrl', ['$scope', '$routeParams', '$location', '$FB', 'FbApp',
	function($scope, $routeParams, $location, $FB, FbApp){
		//Checks if the user *can* install the app
		//If so, shows them what's about to happen
		//Installs the app and redirect to /success

		//Init variables
		$scope.app_alias = $routeParams.alias;
		$scope.install_able = false;
		$scope.error = {
			scope: false,
			admin: false,
			perms: false,
			install: false
		};

		//Download Facebook App
		$scope.fbApp = FbApp.get({alias: $scope.app_alias}, function(fbApp){
			$scope.fbApp = fbApp;
			getAppPageNames();

			//Init Facebook login
			updateLoginStatus(loginCb);
		});

		//Event handlers
		$scope.installApp = function(){
			$FB.api('/me/tabs', 'post', { app_id: $scope.fbApp.app_id, access_token: $scope.fbApp.page_token }, function(res){
				if(res == true){
					$location.path("/success/" + $scope.app_alias);
				}else{
					$scope.error.install = true;
				}
			});
		};

		$scope.cancel = function(){
			$location.path("/cancelled");
		};

		$scope.login = function(){
			$scope.error = {
				scope: false,
				admin: false,
				perms: false,
				install: false
			};

			$FB.login(function(res){
				if(res.authResponse){
					updateLoginStatus(loginCb);
				}
			}, {scope: 'manage_pages'});
		};

		$scope.userPic = function(){
			if($scope.user){
				return "https://graph.facebook.com/" + $scope.user.id + "/picture?width=32&height=32";
			}else{
				return "img/blank.png"
			}
		}

		$scope.pagePic = function(){
			if($scope.fbApp){
				return "https://graph.facebook.com/" + $scope.fbApp.page_id + "/picture?width=75&height=75";
			}else{
				return "img/blank.png"
			}
		}

		$scope.appPic = function(){
			if($scope.fbApp){
				return "https://graph.facebook.com/" + $scope.fbApp.app_id + "/picture?width=75&height=75";
			}else{
				return "img/blank.png"
			}
		}

		//Helper functions
		function updateLoginStatus(callback){
			$FB.getLoginStatus(function(res){
				$scope.loginStatus = res;

				(callback || angular.noop)();
			});
		}

		function loginCb(){
			handleLogin(function(){
				//Check if the app is already installed
				checkAppInstalled();
				//Download user name and picture
				updateApiMe();
				//Start checking if user can install the app
				checkAppInstallable();
			});
		}

		function handleLogin(callback){
			if($scope.loginStatus.status != "connected"){
				$location.path("/start/" + $scope.app_alias);
			}else{
				(callback || angular.noop)();
			}
		}

		function updateApiMe(){
			$FB.api('/me', function(res){
				$scope.user = res;
			});
		}

		function getAppPageNames(){
			$FB.api('/' + $scope.fbApp.app_id, function(res){
				$scope.fbApp.app_name = res.name;
			});
			$FB.api('/' + $scope.fbApp.page_id, function(res){
				$scope.fbApp.page_name = res.name;
			});
		}

		function checkAppInstalled(){
			$FB.api('/' + $scope.fbApp.page_id + '/tabs/' + $scope.fbApp.app_id, function(res){
				if(res.data.length >= 1){
					//Already installed
					$location.path("/success/" + $scope.app_alias);
					return;
				}
				//Not installed yet, carry on
			});
		}

		function checkAppInstallable(){
			$FB.api('/me/accounts?fields=app_id,name,access_token,perms&filter=162449550452729&type=page', function(res){
				if(res.data.length == 0){
					//No data, this is most likely because the permission wasn't granted
					$scope.error.scope = true;
				}else{
					//Iterate the data until we find the right page
					for(var i = 0; i < res.data.length; i++){
						var page = res.data[i];
						if(page.id == $scope.fbApp.page_id){
							for(var j = 0; j < page.perms.length; j++){
								if(page.perms[j] == "EDIT_PROFILE"){
									//Everything is OK!
									$scope.fbApp.page_token = page.access_token;
									$scope.install_able = true;
									return;
								}
							}
							//We've seen all perms and EDIT_PROFILE wasn't one of them
							$scope.error.perms = true;
							return;
						}
					}
					//We've reached the end but we haven't found the page
					$scope.error.admin = true;
				}
			});
		}
	}]);

fbAppControllers.controller('SuccessCtrl', ['$scope', '$routeParams', '$location', '$FB', 'FbApp',
	function($scope, $routeParams, $location, $FB, FbApp){
		//Show success and redirect link

		//Init variables
		$scope.app_alias = $routeParams.alias;

		//Download Facebook App
		$scope.fbApp = FbApp.get({alias: $scope.app_alias}, function(fbApp){
			$scope.fbApp = fbApp;
			getAppPageNames();

			//Init Facebook login
			updateLoginStatus(loginCb);
		});

		$scope.userPic = function(){
			if($scope.user){
				return "https://graph.facebook.com/" + $scope.user.id + "/picture?width=32&height=32";
			}else{
				return "img/blank.png"
			}
		}

		//Helper functions
		function updateLoginStatus(callback){
			$FB.getLoginStatus(function(res){
				$scope.loginStatus = res;

				(callback || angular.noop)();
			});
		}

		function loginCb(){
			handleLogin(function(){
				//Download user name and picture
				updateApiMe();
			});
		}

		function handleLogin(callback){
			if($scope.loginStatus.status != "connected"){
				$location.path("/start/" + $scope.app_alias);
			}else{
				(callback || angular.noop)();
			}
		}

		function updateApiMe(){
			$FB.api('/me', function(res){
				$scope.user = res;
			});
		}

		function getAppPageNames(){
			$FB.api('/' + $scope.fbApp.app_id, function(res){
				$scope.fbApp.app_name = res.name;
			});
			$FB.api('/' + $scope.fbApp.page_id, function(res){
				$scope.fbApp.page_name = res.name;
			});
		}
	}]);
