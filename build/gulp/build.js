var gulp = require('gulp');
var paths = require('../paths');
var runSequence = require('run-sequence');
var changed = require('gulp-changed');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var typescript = require('gulp-tsb');

// Transpile Typescript
var typescriptCompiler = typescriptCompiler || null;
gulp.task('build-system', function() {
	if(!typescriptCompiler) {
    typescriptCompiler = typescript.create(require('../../tsconfig.json').compilerOptions);
  }

	return gulp.src(paths.dtsSrc.concat(paths.source))
		.pipe(plumber())
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(typescriptCompiler())
		.pipe(sourcemaps.write({includeContent: true}))
		.pipe(gulp.dest(paths.output));;
});

// Cleans everything up then compiles again
gulp.task('build', function(callback) {
	return runSequence(
		'clean',
		['build-system'],
    callback
	);
});
