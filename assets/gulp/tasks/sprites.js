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

	gulp.task( 'sprites-clean', ( callback ) => {
		return spritesClean( callback );
	} );

	gulp.task( 'sprites-smith', () => {
		return spritesSmith();
	} );

	gulp.task( 'sprites',  gulp.series('sprites-clean', 'sprites-smith') );

	/*******************
	 * Task functions
	 ******************/
	/**
	 * Delete first.
	 *
	 * @since 1.0.0
	 *
	 * @returns {*}
	 */
	function spritesClean(callback) {
		var settings = config.sprites.clean;

		plugins.del( settings.src ).then( function () {
			plugins.util.log( plugins.util.colors.bgGreen( 'Sprites are now clean....[clean()]' ) );
		} );

		callback(); // signal task completion, check https://gulpjs.com/docs/en/getting-started/async-completion
	};

	/**
	 * Concatenate images into a single PNG sprite.
	 * 
	 * @since 1.0.0
	 * 
	 * @returns {*}
	 */
	function spritesSmith() {

		var settings = config.sprites.spritesmith;

		return gulp.src( settings.src )

		           // Deal with errors.
		           .pipe( plugins.plumber( {errorHandler: handleErrors} ) )
		           .pipe( plugins.spritesmith( {
			           imgName: 'sprites.png',
			           cssName: '../../assets/sass/base/_sprites.scss',
			           imgPath: 'assets/images/sprites.png',
			           algorithm: 'binary-tree'
		           } ) )
		           .pipe( gulp.dest( settings.dest ) ).on( 'end', function () {
				plugins.util.log( plugins.util.colors.bgGreen( 'Sprites are now optimized....[spritesmith()]' ) );
			} )
		           .pipe( plugins.notify( {message: 'Stripes are optimized.'} ) )
		           .pipe( plugins.browserSync.stream() );
	};
};