(function () {
	'use strict';

	var app = angular.module('swappingscout', ['ngRoute', 'schemaForm', 'ui.grid', 'ui.bootstrap', 'angular-growl']);

	app.config(function swappingscoutConfig(growlProvider) {

		//Configurazioni GROWL (Notifiche errori)
		growlProvider.globalPosition('top-right');
		growlProvider.onlyUniqueMessages(true);
		growlProvider.globalTimeToLive(5000);
		growlProvider.globalDisableCountDown(true);
	});
})();