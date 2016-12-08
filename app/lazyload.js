(function() {
    app.config(function($ocLazyLoadProvider) {
        var modules = [{
            name: 'MainCtrl',
            files: ['modules/index/main.js']
        }, {
        	name: 'LoginCtrl',
            files: ['modules/login/login.js']
        }]
        $ocLazyLoadProvider.config({
            debug: false,
            events: true,
            modules: modules
        });
    });
})();
