(function () {
	'use strict';

	var app = angular.module('swappingscout');

	app.controller('homeController', ['$scope', '$http', '$timeout', 'uiGridConstants', 'growl', homeController]);

	function homeController($scope, $http, $timeout, uiGridConstants, growl) {

		$scope.start = function () {
			growl.info('swapping start...');
			$scope.gridOptions.data = {};

			$http.get('/start')
				.then(function (response) {

					var _res = response.data;
					if (_res === 'done!') {
						readResult();
						growl.success('Done!');
					}

				}, function (response) {
					//Second function handles error
					growl.error('Something went wrong', { title: 'ERROR!' });
				});
		};

		$scope.gridOptions = {
			enableHorizontalScrollbar: 0,
			enableFiltering: false,
			showColumnFooter: true,
			columnDefs: [
				{ name: 'Nome', field: 'consumer' },
				{ name: 'Assegnato', field: 'label' },
				{ name: 'Puntata', field: 'bet', aggregationType: uiGridConstants.aggregationTypes.sum },
				{ name: 'Punti', field: 'point', aggregationType: uiGridConstants.aggregationTypes.sum },
			],
			onRegisterApi: function (gridApi) {
				$scope.gridApi = gridApi;
				var cellTemplate = '<div class="ui-grid-cell-contents"> <a class="center clickable" ng-click="grid.appScope.remove(row)" data-toggle="tooltip" title="Consegnato!"><i class="glyphicon glyphicon-share-alt"></i></a></div>';
				$scope.gridApi.core.addRowHeaderColumn({ name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: cellTemplate });
			}
		};

		$scope.toggleFiltering = function (scopeGrid, gridApi) {
			scopeGrid.enableFiltering = !scopeGrid.enableFiltering;
			gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
		};

		$scope.remove = function (row) {
			$http.delete('/api/Objects?[where][code]=' + row.entity.label)
				.then(function (response) {
					$http.delete('/api/results/' + row.entity.id)
						.then(function (response) {
							console.log('cancellazione effettuata!');
							readResult();
							growl.success('Oggetto consegnato :)');
						}, function (response) {
							//Second function handles error
							growl.error('Something went wrong', { title: 'ERROR!' });
						});
				}, function (response) {
					//Second function handles error
					growl.error('Something went wrong', { title: 'ERROR!' });
				});
		}

		function readResult() {
			$http.get('/api/results')
				.then(function (response) {
					$scope.gridOptions.data = response.data; // TODO controllare la response vuota

				}, function (response) {
					//Second function handles error
					growl.error('Something went wrong', { title: 'ERROR!' });
				});
		};

		$timeout(function () {
			readResult();
		});
	}
})();