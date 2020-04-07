/**
 * scripts.js - Builds the distribution JavaScript and jQuery files
 *
 * @package     UpGulp
 * @since       1.0.0
 * @author      hellofromTonya
 * @link        https://KnowTheCode.io
 * @license     GNU-2.0+
 */

'use strict';

module.exports = function ( gulp, plugins, config ) {

	var handleErrors = require( config.gulpDir + 'utils/handleErrors.js' );

	/**
	 * The tasks are synchronous to ensure the order is maintained and
	 * avoid any potential conflicts with the promises.
	 *
	 * @since 1.0.0
	 */

	/*******************
	 * Task chain
	 ******************/

	gulp.task( 'icons-clean', ( callback ) => {
		return iconsClean( callback );
	} );

	gulp.task( 'icons-optimization', () => {
		return iconsOptimization();
	} );

	gulp.task( 'icons',  gulp.series('icons-clean', 'icons-optimization') );

	/*******************
	 * Task functions
	 ******************/

	/**
	 * Delete the .css before we minify and optimize
	 */
	function iconsClean( callback ) {
		var settings = config.icons.clean;

		plugins.del( settings.src ).then( function () {
			plugins.util.log( plugins.util.colors.bgGreen( 'Icons are now clean....[clean()]' ) );
		} );

		callback(); // signal task completion, check https://gulpjs.com/docs/en/getting-started/async-completion
	};

	/**
	 * Minify, concatenate, and clean SVG icons.
	 *
	 * @since 1.0.0
	 *
	 * @return {*}
	 */
	function iconsOptimization() {
		var settings = config.icons.svg;

		return gulp.src( settings.src )

		           // Deal with errors.
		           .pipe( plugins.plumber( {errorHandler: handleErrors} ) )

		           .pipe( plugins.svgmin() )
		           .pipe( plugins.rename( {prefix: 'icon-'} ) )
		           .pipe( plugins.svgstore( {inlineSvg: true} ) )
		           .pipe( plugins.cheerio( {
			           run: function ( $, file ) {
				           $( 'svg' ).attr( 'style', 'display:none' );
				           $( '[fill]' ).removeAttr( 'fill' );
			           },
			           parserOptions: {xmlMode: true}
		           } ) )

		           .pipe( gulp.dest( settings.dest ) ).on( 'end', function () {
						plugins.util.log( plugins.util.colors.bgGreen( 'Icons are now optimized....[icons:svg()]' ) );
					} )
		           .pipe( plugins.browserSync.stream() )
		           .pipe( plugins.notify( {message: 'Icons are optimized.'} ) );
	};
};