(function () {
	'use strict';

	var app = angular.module('swappingscout');

	app.controller('consumerController', ['$scope', '$http', '$timeout', 'uiGridConstants', 'growl', consumerController]);

	function consumerController($scope, $http, $timeout, uiGridConstants, growl) {

		var objs = [];
		var titleMap = {};

		$scope.schema = {};
		$scope.form = [];
		$scope.model = {};

		$scope.onSubmit = function (form) {
			// First we broadcast an event so all fields validate themselves
			//$scope.$broadcast('schemaFormValidate');

			// Then we check if the form is valid
			if (form.$valid) {
				//$scope.obj.push($scope.model);
				saveConsumer(createConsumers($scope.model));
			}
		};

		function createConsumers(model) {
			var consumer = { name: model.name, obj: [] };

			if (model.firstChoice) {
				consumer.obj.push({
					'label': $scope.model.firstChoice,
					'bet': 15,
					'assign': false
				});
			}
			if (model.secondChoice) {
				consumer.obj.push({
					'label': $scope.model.secondChoice,
					'bet': 10,
					'assign': false
				});
			}
			if (model.threeChoice) {
				consumer.obj.push({
					'label': $scope.model.threeChoice,
					'bet': 5,
					'assign': false
				});
			}

			return consumer;
		}

		$scope.cancel = function () {
			$scope.model = {};
		};

		function initForm() {
			$scope.schema = {
				type: 'object',
				title: 'Comment',
				properties: {
					name: {
						title: 'Nome e Cognome',
						type: 'string'
					},
					firstChoice: {
						title: 'Seleziona la prima scelta',
						type: 'string',
						enum: objs
					},
					secondChoice: {
						title: 'Seleziona la seconda scelta',
						type: 'string',
						enum: objs
					},
					threeChoice: {
						title: 'Seleziona la terza scelta',
						type: 'string',
						enum: objs
					}
				},
				required: [
					'name',
					'firstChoice'
				]
			};

			$scope.form = [
				'name',
				{
					type: 'section',
					htmlClass: 'row',
					items: [
						{
							type: 'section',
							htmlClass: 'col-xs-4',
							items: [
								{
									key: 'firstChoice',
									type: 'select',
									titleMap: titleMap
								}
							]
						},
						{
							type: 'section',
							htmlClass: 'col-xs-4',
							items: [
								{
									key: 'secondChoice',
									type: 'select',
									titleMap: titleMap
								}
							]
						},
						{
							type: 'section',
							htmlClass: 'col-xs-4',
							items: [
								{
									key: 'threeChoice',
									type: 'select',
									titleMap: titleMap
								}
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
		};

		$scope.gridOptions = {
			enableFiltering: false,
			columnDefs: [
				{ name: 'Nome', field: 'name' },
				{ name: '1a scelta', field: 'obj[0].label' },
				{ name: '2a scelta', field: 'obj[1].label' },
				{ name: '3a scelta', field: 'obj[2].label' },
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

			$http.delete('/api/Consumers/' + row.entity.id)
				.then(function (response) {
					growl.success('<strong>Oggetto rimosso</strong>');

					readConsumer();
				}, function (response) {
					//Second function handles error
					growl.error('Something went wrong', { title: 'ERROR!' });
				});
		}

		function saveConsumer(consumer) {
			$http.post('/api/Consumers', consumer)
				.then(function (response) {
					growl.info('<strong>Salvataggio effettuato</strong>');

					readConsumer();
				}, function (response) {
					//Second function handles error
					growl.error('Something went wrong', { title: 'ERROR!' });
				});
		};

		function readConsumer() {
			$http.get('/api/Consumers')
				.then(function (response) {
					$scope.gridOptions.data = response.data;
				}, function (response) {
					//Second function handles error
					growl.error('Something went wrong', { title: 'ERROR!' });
				});
		};

		function readObj() {
			$http.get('/api/Objects')
				.then(function (response) {

					_.forEach(response.data, function (value) {

						objs.push(value.code);
						titleMap[value.code] = value.code + ' - ' + value.description;
					})
					initForm();

				}, function (response) {
					//Second function handles error
					growl.error('Something went wrong', { title: 'ERROR!' });
				});
		};

		$timeout(function () {
			readObj()
			readConsumer();
		});

	}
})();