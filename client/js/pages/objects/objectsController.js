(function () {
	'use strict';

	var app = angular.module('swappingscout');

	app.controller('objectsController', ['$scope', '$http', '$timeout', 'uiGridConstants', 'growl', objectsController]);

	function objectsController($scope, $http, $timeout, uiGridConstants, growl) {

		$scope.obj = [];

		$scope.schema = {
			type: 'object',
			properties: {
				code: {
					title: 'Codice',
					type: 'string'
				},
				description: {
					title: 'Descrizione',
					type: 'string'
				},
			},
			required: [
				'code', 'description'
			]
		};

		$scope.form = [
			{
				type: 'section',
				htmlClass: 'row',
				items: [
					{
						type: 'section',
						htmlClass: 'col-xs-6',
						items: [
							'code'
						]
					},
					{
						type: 'section',
						htmlClass: 'col-xs-6',
						items: [
							'description'
						]
					}
				]
			},
			{
				type: 'actions',
				items: [
					{ type: 'submit', style: 'btn-info', title: 'Salva' },
					{ type: 'button', title: 'Cancel', onClick: 'cancel()' }
				]
			}
		];

		$scope.model = {};

		$scope.onSubmit = function (form) {
			// First we broadcast an event so all fields validate themselves
			//$scope.$broadcast('schemaFormValidate');

			// Then we check if the form is valid
			if (form.$valid) {
				$scope.obj.push($scope.model);
				saveObj({ 'code': $scope.model.code.toLowerCase(), 'description': $scope.model.description });
			}
		};

		$scope.cancel = function () {
			$scope.model = {};
		};

		$scope.gridOptions = {
			enableFiltering: false,
			columnDefs: [
				{ name: 'Codice', field: 'code' },
				{ name: 'Descrizione', field: 'description' }
			],
			onRegisterApi: function (gridApi) {
				$scope.gridApi = gridApi;
				var cellTemplate = '<div class="ui-grid-cell-contents"> <a class="center clickable" ng-click="grid.appScope.remove(row)"><i class="glyphicon glyphicon-trash"></i></a></div>';
				$scope.gridApi.core.addRowHeaderColumn({ name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: cellTemplate });
			}
		};

		$scope.toggleFiltering = function (scopeGrid, gridApi) {
			scopeGrid.enableFiltering = !scopeGrid.enableFiltering;
			gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
		};

		$scope.remove = function (row) {

			$http.delete('/api/Objects/' + row.entity.id)
				.then(function (response) {
					growl.success('<strong>Oggetto rimosso</strong>');

					readObj();
				}, function (response) {
					//Second function handles error
					growl.error('Something went wrong', { title: 'ERROR!' });
				});
		}


		function saveObj(obj) {
			$http.post('/api/Objects', obj)
				.then(function (response) {
					growl.info('<strong>Salvataggio effettuato</strong>');

					readObj();
				}, function (response) {
					//Second function handles error
					growl.error('Something went wrong', { title: 'ERROR!' });
				});
		};

		function readObj() {
			$http.get('/api/Objects')
				.then(function (response) {
					$scope.gridOptions.data = response.data;
				}, function (response) {
					//Second function handles error
					growl.error('Something went wrong', { title: 'ERROR!' });
				});
		};

		$timeout(function () {
			readObj();
		})
	}
})();