// Copyright 2023, University of Colorado Boulder

/**
 * Colors used throughout this simulation.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import PhetColorScheme from '../../scenery-phet/js/PhetColorScheme.js';
import { Color, ProfileColorProperty } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import solarSystemCommon from './solarSystemCommon.js';

const SolarSystemCommonColors = {

  // Color mainly used for foreground things like text
  foregroundProperty: new ProfileColorProperty( solarSystemCommon, 'foreground', {
    default: 'white',
    projector: 'black'
  } ),

  backgroundProperty: new ProfileColorProperty( solarSystemCommon, 'background', {
    default: 'black',
    projector: 'white'
  } ),

  controlPanelFillProperty: new ProfileColorProperty( solarSystemCommon, 'controlPanelFill', {
    default: 'rgb( 40, 40, 40 )',
    projector: new Color( 222, 234, 255 )
  } ),

  gridIconStrokeColorProperty: new ProfileColorProperty( solarSystemCommon, 'gridIconStroke', {
    default: 'gray',
    projector: 'black'
  } ),

  userControlledBackgroundColorProperty: new ProfileColorProperty( solarSystemCommon, 'userControlledBackgroundColor', {
    default: PhetColorScheme.BUTTON_YELLOW
  } ),

  velocityColorProperty: new ProfileColorProperty( solarSystemCommon, 'velocityColor', {
    default: PhetColorScheme.VELOCITY,
    projector: '#44b052'
  } ),

  gravityColorProperty: new ProfileColorProperty( solarSystemCommon, 'gravityColor', {
    default: PhetColorScheme.GRAVITATIONAL_FORCE
  } ),

  body1ColorProperty: new ProfileColorProperty( solarSystemCommon, 'body1Color', {
    default: 'yellow',
    projector: '#FFAE00'
  }, {
    tandem: Tandem.COLORS.createTandem( 'body1ColorProperty' )
  } ),

  body2ColorProperty: new ProfileColorProperty( solarSystemCommon, 'body2Color', {
    default: 'magenta'
  }, {
    tandem: Tandem.COLORS.createTandem( 'body2ColorProperty' )
  } ),

  body3ColorProperty: new ProfileColorProperty( solarSystemCommon, 'body3Color', {
    default: 'cyan',
    projector: '#0055FF'
  }, {
    tandem: Tandem.COLORS.createTandem( 'body3ColorProperty' )
  } ),

  body4ColorProperty: new ProfileColorProperty( solarSystemCommon, 'body4Color', {
    default: 'green'
  }, {
    tandem: Tandem.COLORS.createTandem( 'body4ColorProperty' )
  } ),

  explosionColorProperty: new ProfileColorProperty( solarSystemCommon, 'explosionColor', {
    default: 'yellow'
  } ),

  orbitColorProperty: new ProfileColorProperty( solarSystemCommon, 'orbitColor', {
    default: 'fuchsia'
  } )
};

solarSystemCommon.register( 'SolarSystemCommonColors', SolarSystemCommonColors );
export default SolarSystemCommonColors;