(function () {
	'use strict';

	var app = angular.module('swappingscout');

	app.controller('navigationController', ['$rootScope',
		'$scope',
		'$route', navigationController]);

	function navigationController($rootScope, $scope, $route) {

		$scope.header = {
			version: '1.0.0 beta'
		};

	}

})();
