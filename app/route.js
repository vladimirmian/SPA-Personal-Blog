(function() {
    'use strict';
    app.config(function($stateProvider, $urlRouterProvider) {
    	//莫名其妙的！就可以了！我曹！什么鬼！
        $stateProvider
        .state('index', {
            url: "/", 
            controller: 'MainCtrl',
            templateUrl: 'modules/index/main.html',
            resolve:{
            	loadCtrl:function($ocLazyLoad){
            		return $ocLazyLoad.load('MainCtrl');
            	}
            }
        })
        .state('login',{
        	url: "/login", 
            controller: 'LoginCtrl',
            templateUrl: 'modules/login/login.html',
            resolve:{
            	loadCtrl:function($ocLazyLoad){
            		return $ocLazyLoad.load('LoginCtrl');
            	}
            }
        });
        $urlRouterProvider.otherwise('/');
    });
})();
