const gulp = require('gulp'),
    autoprefixer = require('autoprefixer'),
    composer = require('gulp-uglify/composer'),
    concat = require('gulp-concat'),
    cssnano = require('cssnano'),
    footer = require('gulp-footer'),
    format = require('date-format'),
    header = require('gulp-header'),
    postcss = require('gulp-postcss'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass')(require('sass')),
    uglifyjs = require('uglify-js'),
    uglify = composer(uglifyjs, console),
    pkg = require('./package.json');

const banner = '/*!\n' +
    ' * <%= pkg.name %>\n' +
    ' * Version: <%= pkg.version %>\n' +
    ' * Build date: ' + format("yyyy-MM-dd", new Date()) + '\n' +
    ' */';
const year = new Date().getFullYear();

gulp.task('js', function () {
    return gulp.src([
        'src/js/jq.multiinput.js'
    ])
        .pipe(concat('jq.multiinput.min.js'))
        .pipe(uglify())
        .pipe(header(banner + '\n', {pkg: pkg}))
        .pipe(gulp.dest('dist/js/'))
});

gulp.task('sass', function () {
    return gulp.src([
        'src/scss/jq.multiinput.scss'
    ])
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([
            autoprefixer()
        ]))
        .pipe(postcss([
            cssnano({
                preset: ['default', {
                    discardComments: {
                        removeAll: true
                    }
                }]
            })
        ]))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(footer('\n' + banner, {pkg: pkg}))
        .pipe(gulp.dest('dist/css/'))
});

gulp.task('watch', function () {
    // Watch .js files
    gulp.watch(['./src/js/**/*.js'], gulp.series('js'));
    // Watch .scss files
    gulp.watch(['./src/scss/**/*.scss'], gulp.series('sass'));
});

// Default Task
gulp.task('default', gulp.series('js', 'sass'));