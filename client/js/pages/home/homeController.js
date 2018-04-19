(function () {
	'use strict';

	var app = angular.module('swappingscout');

	app.controller('homeController', ['$scope', '$timeout', 'growl', homeController]);

	function homeController($scope, $timeout, growl) {
		var smiles = [';D', '=P', 'O_O', 'O.o', ':)', '#.#', 'XD', '-_-', '^_^'];

		$scope.smile = '';

		$scope.giveAsmile = function () {
			return smiles[getRandom(0, smiles.length - 1)].toString();
		};

		function getRandom(min, max) {
			return parseInt(Math.random() * (max - min) + min);
		};

		$timeout(function () {
			$scope.smile = $scope.giveAsmile();
		})
	}
})();