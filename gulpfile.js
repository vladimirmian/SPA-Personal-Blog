'use strict'
let gulp = require('gulp'),
    path = require('path'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    inject = require('gulp-inject'),
    gutil = require('gulp-util'),
    angularfilesort = require('gulp-angular-filesort'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    eslint = require('gulp-eslint'),
    htmlmin = require('gulp-htmlmin'),
    templateCache = require('gulp-angular-templatecache'),
    size = require('gulp-size'),
    useref = require('gulp-useref'),
    rename = require('gulp-rename'),
    wiredep = require('wiredep').stream;
var browserSync = require('browser-sync');
var browserSyncSpa = require('browser-sync-spa');
var proxy = require('http-proxy-middleware');
//压缩html成为脚本
gulp.task('htmltoTemplate', function() {
    var htmlOptions = {
        removeComments: true, //清除HTML注释
        collapseWhitespace: true, //压缩HTML
        collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
    }
    return gulp.src('app/modules/**/*.html')
        .pipe(htmlmin(htmlOptions))
        .pipe(templateCache('templates.js', {
            module: 'templateCache',
            root: 'modules',
            standalone: true
        }))
        .pipe(gulp.dest('app/libs'));
});
//注入脚本
gulp.task('inject-prod', function() {
    var injectBower = gulp.src([
            'app/bower_components/**/*.min.js',
            'app/bower_components/**/*-min.js'
        ], { read: false }),
        injectBowerStyle = gulp.src([
            'app/bower_components/**/**/*.min.css'
        ], { read: false });

    return gulp.src('app/*.html')
        .pipe(inject(injectBowerStyle, { name: 'bower', relative: true }))
        .pipe(inject(injectBower, { name: 'bower', relative: true }))
        .pipe(gulp.dest('app'));
});
gulp.task('inject-dev', ['styles', 'htmltoTemplate'], function() {
    var injectModules = gulp.src([
            'app/*.js',
            'app/config/*.js',
            //'app/modules/**/*.js'//改成了按照路由加载
        ], { read: false }),
        injectModuleStyle = gulp.src('app/css/*.css'),
        templateCache = gulp.src('app/libs/templates.js', { read: false });
        
    return gulp.src('app/*.html')
        .pipe(inject(injectModules, { relative: true }))
        .pipe(inject(templateCache, {
            starttag: '<!-- inject:templateCache -->',
            relative: true
        }))
        .pipe(inject(injectModuleStyle, { name: 'product', relative: true }))
        .pipe(gulp.dest('app'));
});
//执行样式注入编译
gulp.task('styles', function() {
    return buildStyles();
});
//执行脚本同步
gulp.task('scipts', function() {
    return buildScripts();
});
gulp.task('inject-reload', ['inject-prod', 'inject-dev'], function() {
    browserSync.reload();
});
gulp.task('styles-reload', ['styles'], function() {
    return buildStyles()
        .pipe(browserSync.stream());
});
gulp.task('js-reload', function() {
    return buildScripts()
        .pipe(browserSync.stream())
});
//监听事件
gulp.task('watch', ['inject-reload'], function() {
    gulp.watch('bower.json', ['inject-prod']);
    //如果是'./'的话，只能监听已经在任务里面文件
    //意思是只能监听文件的删除，但是不能监听文件的增加
    //只要去掉了，就能监听文件的增加了
    gulp.watch([
        'app/**/*.scss',
        'app/**/**/*.scss'
    ], function(cb) {
        if (isOnlyChange(cb)) {
            gulp.start("styles-reload");
        } else {
            gulp.start('inject-reload');
        }
    });

    gulp.watch([
        'app/*.js',
        'app/config/*.js',
        'app/libs/*.js',
        'app/modules/**/*.js'
    ], function(cb) {
        if (isOnlyChange(cb)) {
            gulp.src(cb.path)
                .pipe(browserSync.stream());
        } else {
            gulp.start('inject-reload');
        }
    });
    gulp.watch('app/index.html', ['inject-reload']);
    gulp.watch('app/**/**/*.html', ['htmltoTemplate'], function(cb) {
        browserSync.reload(cb.path);
    });
});
//开发服务代理
gulp.task('serve', ['watch'], function() {
    browserSync.init({
        port: 9105,
        startPath: '/',
        //open: 'local',
        server: {
            baseDir: 'app',
            index: 'index.html',
            middleware: proxy('/api', {
                target: 'http://tmct.73go.cn/api/',
                changeOrigin: true
            })
        },
        brower: 'default'
    });
});
//打包后服务
gulp.task('serve:dist', ['build'], function() {
    browserSync.init({
        port: 9106,
        startPath: '/',
        open: 'local',
        server: {
            baseDir: 'dist',
            index: 'index.html',
            middleware: proxy('/api', {
                target: 'http://tmct.73go.cn/api/',
                changeOrigin: true
            })
        },
        brower: 'default'
    });
});
/**下面是要build**/


/*gulp.task('html', ['inject-prod', 'htmltoTemplate'], function() {
    var templateCache = gulp.src('app/libs/templates.js', { read: false });
    return gulp.src('app/*.html')
        .pipe(inject(templateCache, {
            starttag: '<!-- inject:templateCache -->',
            relative: true,
        }))
        .pipe(gulp.dest('app'));
});*/







//监听一下是不是改变？
function isOnlyChange(event) {
    return event.type === 'changed';
}
//处理每一个JS文件
function buildScripts() {
    var scriptsPath = gulp.src([
        '!app/bower_components/',
        '!app/css',
        '!app/scss',
        'app/*.js',
        'app/config/*.js',
        'app/modules/**/*.js'
    ]);
    return scriptsPath
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(size());
}
//处理scss文件，注入index.html
function buildStyles() {
    var sassPath = gulp.src([
            '!app/scss/*.scss',
            'app/scss/**/*.scss'
        ]),
        sassOptions = {
            outputStyle: 'compressed',
            precision: 10
        },
        sassInjectOptions = {
            name: 'prod',
            relative: true,
            addRootSlash: false
        };
    return gulp.src('app/scss/*.scss')
        .pipe(inject(sassPath, sassInjectOptions))
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(rename('app.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('app/css'));
}
