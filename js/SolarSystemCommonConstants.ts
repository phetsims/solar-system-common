// Copyright 2023, University of Colorado Boulder

/**
 * Constants used throughout the My Solar System and Kepler's Laws Simulations.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import PhetFont from '../../scenery-phet/js/PhetFont.js';
import SolarSystemCommonColors from './SolarSystemCommonColors.js';
import solarSystemCommon from './solarSystemCommon.js';
import { DEFAULT_SEPARATOR_LAYOUT_OPTIONS, HSeparatorOptions, RichTextOptions, TLayoutOptions } from '../../scenery/js/imports.js';
import { combineOptions } from '../../phet-core/js/optionize.js';
import { PanelOptions } from '../../sun/js/Panel.js';
import Vector2 from '../../dot/js/Vector2.js';

export const METERS_PER_AU = 149597870700;
export const SECONDS_PER_YEAR = 31557600; // 365.25 days/year x 24 hrs/day x 60 min/hr x 60 sec/min
export const G = 10000; // gravitational constant within the model. This value is easier for computations than the real G.
export const G_ACTUAL = 6.6743e-11; // gravitational constant

// Multipliers that map from non-standard model units to standard units
export const POSITION_MULTIPLIER = 0.01;
export const MASS_MULTIPLIER = 1e28;
export const TIME_MULTIPLIER = Math.pow( POSITION_MULTIPLIER, 3 / 2 ) * Math.sqrt( G ) * Math.pow( METERS_PER_AU, 3 / 2 ) / ( Math.sqrt( G_ACTUAL ) * Math.sqrt( MASS_MULTIPLIER ) * SECONDS_PER_YEAR );
export const VELOCITY_MULTIPLIER = POSITION_MULTIPLIER / TIME_MULTIPLIER * METERS_PER_AU / SECONDS_PER_YEAR / 1000;

console.log( VELOCITY_MULTIPLIER );

const allVectors = [
  new Vector2( 0, 81.6 )
];

const rounding = 10000;
console.log( allVectors.map( ( object, index ) => {
  return object.timesScalar( VELOCITY_MULTIPLIER * rounding ).roundedSymmetric().dividedScalar( rounding );
} ) );

const COLUMN_TITLE_OPTIONS: RichTextOptions = {
  font: new PhetFont( 16 ),
  fill: SolarSystemCommonColors.foregroundProperty
};

const HSEPARATOR_OPTIONS: HSeparatorOptions = {
  lineWidth: 2,
  stroke: '#8E9097',
  layoutOptions: combineOptions<TLayoutOptions>( {}, DEFAULT_SEPARATOR_LAYOUT_OPTIONS, { yMargin: 2 } )
};

const PANEL_OPTIONS: PanelOptions = {
  stroke: null,
  fill: SolarSystemCommonColors.controlPanelFillProperty,
  cornerRadius: 5,
  xMargin: 10,
  yMargin: 10,
  layoutOptions: {
    stretch: true
  }
};

const SolarSystemCommonConstants = {

  // ScreenView margins
  SCREEN_VIEW_X_MARGIN: 10,
  SCREEN_VIEW_Y_MARGIN: 10,

  // Default option values
  COLUMN_TITLE_OPTIONS: COLUMN_TITLE_OPTIONS,
  HSEPARATOR_OPTIONS: HSEPARATOR_OPTIONS,
  PANEL_OPTIONS: PANEL_OPTIONS,

  // Fonts
  BUTTON_FONT: new PhetFont( 16 ),
  COMBO_BOX_ITEM_FONT: new PhetFont( 16 ),
  NUMBER_DISPLAY_FONT: new PhetFont( 16 ),

  MASS_SLIDER_STEP: 25,
  GRID_SPACING: 1,
  VBOX_SPACING: 7,
  DEFAULT_SOUND_OUTPUT_LEVEL: 0.2,

  INITIAL_VECTOR_OFFSCALE: -1.3, // The initial offscale value for the gravity vector arrows

  // Multipliers that map from non-standard model units to standard units
  POSITION_MULTIPLIER: POSITION_MULTIPLIER, // Transforms from model units to AU
  VELOCITY_MULTIPLIER: VELOCITY_MULTIPLIER, // Transforms from model units to AU/yr then to km/s
  TIME_MULTIPLIER: TIME_MULTIPLIER // Transforms from model units to years
};

solarSystemCommon.register( 'SolarSystemCommonConstants', SolarSystemCommonConstants );
export default SolarSystemCommonConstants;

