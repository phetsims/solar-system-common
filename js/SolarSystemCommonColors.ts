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

const PANEL_FILL_DEFAULT = new Color( 40, 40, 40 );
const PANEL_FILL_PROJECTOR = new Color( 222, 234, 255 );

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

  panelFillProperty: new ProfileColorProperty( solarSystemCommon, 'panelFill', {
    default: PANEL_FILL_DEFAULT,
    projector: PANEL_FILL_PROJECTOR
  } ),

  // Subtle stroke to give Panels and AccordionBoxes a crisp edge
  panelStrokeProperty: new ProfileColorProperty( solarSystemCommon, 'panelStroke', {
    default: PANEL_FILL_DEFAULT.brighterColor( 0.65 ),
    projector: PANEL_FILL_PROJECTOR.darkerColor( 0.85 )
  } ),

  gridIconStrokeColorProperty: new ProfileColorProperty( solarSystemCommon, 'gridIconStroke', {
    default: 'gray',
    projector: 'black'
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
    tandem: Tandem.COLORS.createTandem( 'body1ColorProperty' ),
    phetioFeatured: true
  } ),

  body2ColorProperty: new ProfileColorProperty( solarSystemCommon, 'body2Color', {
    default: 'magenta'
  }, {
    tandem: Tandem.COLORS.createTandem( 'body2ColorProperty' ),
    phetioFeatured: true
  } ),

  body3ColorProperty: new ProfileColorProperty( solarSystemCommon, 'body3Color', {
    default: 'cyan',
    projector: '#0055FF'
  }, {
    tandem: Tandem.COLORS.createTandem( 'body3ColorProperty' ),
    phetioFeatured: true
  } ),

  body4ColorProperty: new ProfileColorProperty( solarSystemCommon, 'body4Color', {
    default: 'green'
  }, {
    tandem: Tandem.COLORS.createTandem( 'body4ColorProperty' ),
    phetioFeatured: true
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