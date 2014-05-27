'use strict'

var gulp = require('gulp')

gulp.task('default', ['lint', 'test'])

var mocha = require('gulp-mocha')
gulp.task('test', function() {
  return gulp.src('test/test.js')
             .pipe(mocha({
               ui: 'tdd',
               reporter: 'spec'
             }))
})

var eslint = require('gulp-eslint')
gulp.task('lint', function() {
  return gulp.src(['lib/**/*.js', 'test/**/*.js', 'gulpfile.js'])
             .pipe(eslint('eslint.json'))
             .pipe(eslint.format())
             .pipe(eslint.failOnError())
})