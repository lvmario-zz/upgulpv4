/**
 * style.js - Builds the distribution stylesheets
 *
 * Tasks include:
 *      1. Linting
 *      2. Compiles the Sass files into CSS and stores them into the Distribution location
 *      3. Minifies the CSS in the Distribution location
 *      4. Moves the style.css file from the Distribution location to the root of your theme
 *
 * @package     UpGulp
 * @since       1.0.3
 * @author      hellofromTonya
 * @link        https://KnowTheCode.io
 * @license     GNU-2.0+
 */

'use strict';

module.exports = function ( gulp, plugins, config ) {

	var handleErrors = require( config.gulpDir + 'utils/handleErrors.js' ),
		bourbon = require( 'bourbon' ).includePaths,
		neat = require( 'bourbon-neat' ).includePaths,
		mqpacker = require( 'css-mqpacker' );

	/**
	 * styles task which is callable
	 *
	 * Tasks are run synchronously to ensure each step is completed
	 * BEFORE moving on to the next one.  We don't want any race situations.
	 *
	 * @since 1.0.1
	 */

	gulp.task( 'styles-clean', (callback) => {
		return cleanStyles( callback );
	} );

	gulp.task( 'styles-build-sass', () => {
		return buildSass( config.styles.postcss );
	} );

	gulp.task( 'styles-minify', () => {
		return minifyStyles( config.styles.cssnano );
	} );

	gulp.task( 'styles-finalize', () => {
		return stylesFinalize( config.styles.cssfinalize );
	} );

	gulp.task( 'styles-final-clean', () => {
		var settings = config.styles.cssfinalize;

		// Fix for Issue #1 - v1.0.3 11.July.2017
		if ( settings.run === true ) {
			cleanStyles( settings );
		}

		plugins.notify( {
			title: "Woot!, Task Done",
			message: 'Heya, styles are gulified.'
		} );
	} )

	gulp.task( 'styles', gulp.series( 
						'styles-clean',			
						'styles-build-sass',
						'styles-minify',
						'styles-finalize',
						'styles-final-clean',
						)
	);

	/*******************
	 * Task functions
	 ******************/

	/**
	 * Delete the .css before we minify and optimize
	 *
	 * @since 1.0.0
	 *
	 * @param settings
	 * @returns {*}
	 */
	function cleanStyles( callback ) {

		var settings = config.styles.clean;

		return plugins.del( settings.src ).then(function(){
			plugins.util.log( plugins.util.colors.bgGreen( 'Styles are now clean....[cleanStyles()]' ) );
		});

		callback(); // signal task completion, check https://gulpjs.com/docs/en/getting-started/async-completion
	}

	/**
	 * Compile Sass and run stylesheet through PostCSS.
	 *
	 * @since 1.0.3
	 *
	 * @param settings
	 * @returns {*}
	 */
	function buildSass( settings ) {
		return gulp.src( settings.src )

	           .pipe( plugins.plumber( {
		           errorHandler: handleErrors
	           } ) )

	           .pipe( plugins.sourcemaps.init() )

	           .pipe( plugins.sass( {
		           includePaths: [].concat( bourbon, neat ),
		           errLogToConsole: true,
		           outputStyle: 'expanded' // Options: nested, expanded, compact, compressed
	           } ) )

	           .pipe( plugins.postcss( [
		           plugins.autoprefixer( settings.autoprefixer ),
		           mqpacker(),
	           ] ) )

	           .pipe( plugins.sourcemaps.write() )

	           // Create *.css.
	           .pipe( gulp.dest( settings.dest ) ).on( 'end', function () {
					plugins.util.log( plugins.util.colors.bgGreen( 'Sass has been compiled into native CSS....[buildSass()]' ) );
				} )
	           .pipe( plugins.browserSync.stream() );
	}

	/**
	 * Minify and optimize style.css.
	 *
	 * @since 1.0.3
	 *
	 * @param settings {}
	 * @returns {*}
	 */
	function minifyStyles( settings ) {

		return gulp.src( settings.src, function( cb ){
				plugins.util.log( plugins.util.colors.bgGreen( 'styles are now minified and optimized....[minifyStyles()]' ) );
			})

           .pipe( plugins.plumber( {errorHandler: handleErrors} ) )

           .pipe( plugins.cssnano( {
	           safe: true
           }))

           .pipe( plugins.rename( function ( path ) {
	           path.basename += ".min";
           } ) )
           .pipe( gulp.dest( settings.dest ) )
           .pipe( plugins.browserSync.stream() );
	};

	/**
	 * Move the style.css file to the theme's root
	 *
	 * @since 1.0.0
	 *
	 * @param settings {}
	 *
	 * @returns {*}
	 */
	function stylesFinalize( settings ) {
		return gulp.src( settings.src, function(){
			    plugins.util.log( plugins.util.colors.bgGreen( 'Styles are all done....[cssfinalize()]' ) );
		} )

		    .pipe( plugins.plumber( {errorHandler: handleErrors} ) )
		    .pipe( gulp.dest( settings.dest ) )
			.pipe( plugins.notify( {title: "Woot!, Task Done", message: 'Hello, styles are gulified.'} ) );
	}

	/**
	 * Sass linting.
	 *
	 * @since 1.0.0
	 *
	 * @returns {*}
	 */
	function sassLint() {
		gulp.src( [
			    'assets/sass/**/*.scss',
			    '!assets/sass/base/_normalize.scss',
			    '!assets/sass/utilities/animate/**/*.*',
			    '!assets/sass/base/_sprites.scss'
		    ] )
		    .pipe( plugins.sassLint() )
		    .pipe( plugins.sassLint.format() )
		    .pipe( plugins.sassLint.failOnError() );
	};
};