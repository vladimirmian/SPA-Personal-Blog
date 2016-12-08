var app = angular.module('martinwebsite', ['ui.router', 'templateCache', 'oc.lazyLoad']);
(function() {
    app.run(function() {
            addEventListener("load", function() { setTimeout(hideURLbar, 0); }, false);
            function hideURLbar() { window.scrollTo(0, 1); }
        })
        .config(function($provide, $compileProvider, $controllerProvider, $filterProvider) {
            app.controller = $controllerProvider.register;
            app.directive = $compileProvider.directive;
            app.filter = $filterProvider.register;
            app.factory = $provide.factory;
            app.service = $provide.service;
            app.constant = $provide.constant;
        })
        .controller('NavCtrl', function($scope, $state) {
            $scope.state = $state;
        });
})();
