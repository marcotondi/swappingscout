(function () {
	'use strict';

	var app = angular.module('swappingscout');

	app.controller('navigationController', ['$scope', '$location', navigationController]);

	function navigationController($scope, $location) {

		$scope.header = {
			version: '1.0.0 beta'
		};

		$scope.isActive = function (viewLocation) {
			return viewLocation === $location.path();
		};

	}

})();
