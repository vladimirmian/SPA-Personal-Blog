(function(){
	'use strict';
	app.controller('MainCtrl', function ($scope,$state) {
		$scope.clickToLogin = function(){
			$state.go('login');
		}
		console.log('i am in');
	});
})();