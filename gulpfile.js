'use strict'

var gulp = require('gulp')

var mocha = require('gulp-mocha')
function test() {
  return gulp.src('test/*.js')
    .pipe(mocha({
      ui: 'tdd',
      reporter: 'spec'
    }))
}

var eslint = require('gulp-eslint')
function lint() {
  return gulp.src(['lib/**/*.js', 'test/**/*.js', 'gulpfile.js'])
    .pipe(eslint('eslint.json'))
    .pipe(eslint.format())
    .pipe(eslint.failOnError())
}

exports.test = test
exports.lint = lint

exports.default = gulp.series(lint, test)
