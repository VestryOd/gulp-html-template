'use strict';

const gulp = require('gulp'),
      sass = require('gulp-sass'),
      cleanCSS = require('gulp-clean-css'),
      sourcemaps = require('gulp-sourcemaps'),
      prefixer = require('gulp-autoprefixer'),
      rigger = require('gulp-rigger'),
      del = require('del'),
      uglify = require('gulp-uglify'),
      browserSync = require('browser-sync').create(),
      imagemin = require('gulp-imagemin'),
      cache = require('gulp-cache');

var path = {
    build: {
        html: 'build/',
        style: 'build/style',
        mapcss: './map',
        js: 'build/js',
        mapjs: './map',
        img: 'build/img',
        static: 'build/static',
        fonts: 'build/fonts'
    },
    src: {
        html: 'src/index.html',
        style: 'src/style/main.sass',
        js: 'src/js/main.js',
        img: 'src/img/**/*.*',
        static: 'src/static/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.sass',
        img: 'src/img/**/*.*',
        static: 'src/static/**/*.*',
        fonts: 'src/fonts/**/*.*'
    }
};

function htmls() {
    return gulp.src(path.src.html)
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(browserSync.stream());
};

function styles() {
    return gulp.src(path.src.style)
        .pipe(sourcemaps.init())
            .pipe(sass())
            .pipe(prefixer({
                browsers: ['> 1%'],
                cascade: false
            }))
            .pipe(cleanCSS({
                level: 1
            }))
        .pipe(sourcemaps.write(path.build.mapcss))
        .pipe(gulp.dest(path.build.style))
        .pipe(browserSync.stream());
};

function scripts() {
    return gulp.src(path.src.js)
        .pipe(rigger())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write(path.build.mapjs))
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.stream());
};

function fonts() {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
        .pipe(browserSync.stream());
};

function other() {
    return gulp.src(path.src.static)
        .pipe(gulp.dest(path.build.static))
        .pipe(browserSync.stream());
};

function images() {
    return gulp.src(path.src.img)
        .pipe(cache(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ])))
        .pipe(gulp.dest(path.build.img))
        .pipe(browserSync.stream());
};

function clean() {
    return del(['build/*']);
};

function clear() {
    return cache.clearAll();
};

function watch() {
    browserSync.init({
        server: {
            baseDir: "./build/"
        },
        tunnel: true
    });

    gulp.watch(path.watch.html, htmls);
    gulp.watch(path.watch.style, styles);
    gulp.watch(path.watch.js, scripts);
    gulp.watch(path.watch.img, images);
    gulp.watch(path.watch.static, other);
    gulp.watch(path.watch.fonts, fonts);
};

gulp.task('clean', clean);
gulp.task('clear', clear);
gulp.task('watch', watch);
gulp.task('html:build', htmls);
gulp.task('style:build', styles);
gulp.task('script:build', scripts);
gulp.task('fonts:build', fonts);
gulp.task('images:build', images);
gulp.task('other:build', other);

gulp.task('build', gulp.series(clean,
                        gulp.parallel(
                            htmls,
                            styles,
                            scripts,
                            fonts,
                            other,
                            images)
                        ));

gulp.task('dev', gulp.series('build', 'watch'));
gulp.task('default', gulp.series('watch'));