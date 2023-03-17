// Copyright 2023, University of Colorado Boulder

/**
 * Constants used throughout this simulation.
 *
 * @author Jonathan Olson
 */

import PhetFont from '../../scenery-phet/js/PhetFont.js';
import SolarSystemCommonColors from './SolarSystemCommonColors.js';
import solarSystemCommon from './solarSystemCommon.js';

const SolarSystemCommonConstants = {

  MARGIN: 15,
  SCREEN_VIEW_X_MARGIN: 15,
  SCREEN_VIEW_Y_MARGIN: 15,

  // Max width for many of the text labels
  TEXT_MAX_WIDTH: 200,

  CONTROL_PANEL_OPTIONS: {
    stroke: null,
    fill: SolarSystemCommonColors.controlPanelFillProperty,
    cornerRadius: 5,
    xMargin: 10,
    yMargin: 10,
    layoutOptions: {
      stretch: true
    }
  },
  CHECKBOX_OPTIONS: {
    boxWidth: 14,
    checkboxColor: SolarSystemCommonColors.foregroundProperty,
    checkboxColorBackground: SolarSystemCommonColors.backgroundProperty
  },
  HSEPARATOR_OPTIONS: {
    lineWidth: 2,
    stroke: '#8E9097',
    layoutOptions: {
      yMargin: 5
    }
  },
  PANEL_FONT: new PhetFont( 16 ),
  TITLE_FONT: new PhetFont( { size: 16, weight: 'bold' } ),
  TEXT_OPTIONS: {
    font: new PhetFont( 16 ),
    fill: SolarSystemCommonColors.foregroundProperty,
    lineWidth: 0.1
  },
  TITLE_OPTIONS: {
    font: new PhetFont( { size: 18, weight: 'bold' } ),
    fill: SolarSystemCommonColors.foregroundProperty
  },

  GRID_SPACING: 100,

  NUM_BODIES: 4,

  CHECKBOX_SPACING: 7,

  DEFAULT_SOUND_OUTPUT_LEVEL: 0.1,

  // Multipliers that modify the numeric value shown in Number Displays
  POSITION_MULTIPLIER: 0.01, // Transforms from model units to AU
  VELOCITY_MULTIPLIER: 0.21061355341275995, // Transforms from model units to AU/yr then to km/s
  TIME_MULTIPLIER: 0.22507907903927651, // Transforms from model units to years

  MAX_ORBITAL_DIVISIONS: 6,
  MIN_ORBITAL_DIVISIONS: 2
};

solarSystemCommon.register( 'SolarSystemCommonConstants', SolarSystemCommonConstants );
export default SolarSystemCommonConstants;