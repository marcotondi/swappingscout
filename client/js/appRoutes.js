(function () {
	'use strict';

	var app = angular.module('swappingscout');
	app.config(config);

	function config($routeProvider, $locationProvider) {
		$routeProvider

			// home page
			.when('/', {
				templateUrl: 'js/pages/home/home.tpl.html',
				controller: 'homeController'
			})

			.when('/consumer', {
				templateUrl: 'js/pages/consumer/consumer.html',
				controller: 'consumerController'
			})

			.when('/objects', {
				templateUrl: 'js/pages/objects/objects.html',
				controller: 'objectsController'
			})

			.when('/swap', {
				templateUrl: 'js/pages/swap/swap.html',
				controller: 'swapController'
			})

			//DEFAULT ROUTE - DASHBOARD
			.otherwise({
				redirectTo: '/'
			});

		$locationProvider.hashPrefix('');
		//$locationProvider.html5Mode(true).hashPrefix('!');;
	}

})();