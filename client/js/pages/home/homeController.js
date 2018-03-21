(function () {
	'use strict';

	var app = angular.module('swappingscout');

	app.controller('homeController', ['$scope', '$http', 'growl', homeController]);

	function homeController($scope, $http, growl) {

		$scope.start = function () {
			$http.get('/start')
				.then(function (response) {
					growl.success(response.data);
				}, function (response) {
					//Second function handles error
					growl.error('Something went wrong', { title: 'ERROR!' });
				});
		};
	}
})();