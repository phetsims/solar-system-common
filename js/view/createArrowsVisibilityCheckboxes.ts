// Copyright 2023, University of Colorado Boulder


/**
 * Visual representation of velocity and gravity arrows checkbox.
 *
 * @author Agustín Vallejo
 */

import ArrowNode from '../../../scenery-phet/js/ArrowNode.js';
import PhetColorScheme from '../../../scenery-phet/js/PhetColorScheme.js';
import { HBox, HBoxOptions, Text, TextOptions } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import MySolarSystemStrings from '../../../my-solar-system/js/MySolarSystemStrings.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';
import SolarSystemCommonCheckbox from './SolarSystemCommonCheckbox.js';
import CommonModel from '../model/CommonModel.js';
import solarSystemCommon from '../solarSystemCommon.js';

// constants
const ARROW_Y_COORDINATE = -10;

const TEXT_OPTIONS = combineOptions<TextOptions>( {
  maxWidth: SolarSystemCommonConstants.MAX_WIDTH
}, SolarSystemCommonConstants.TEXT_OPTIONS );

const SPACING = 10;

const createArrowsVisibilityCheckboxes = ( model: CommonModel, tandem: Tandem ): SolarSystemCommonCheckbox[] => {
  return [
    // gravity force checkbox
    new SolarSystemCommonCheckbox( model.gravityVisibleProperty, new HBox( combineOptions<HBoxOptions>( {
      children: [
        new Text( MySolarSystemStrings.gravityForceStringProperty, TEXT_OPTIONS ),
        new ArrowNode( 135, ARROW_Y_COORDINATE, 180, ARROW_Y_COORDINATE, { fill: PhetColorScheme.GRAVITATIONAL_FORCE } )
      ]
    }, {
      spacing: SPACING
    } ) ), {
      tandem: tandem.createTandem( 'gravityForceCheckbox' )
    } ),
    // velocity checkbox
    new SolarSystemCommonCheckbox( model.velocityVisibleProperty, new HBox( combineOptions<HBoxOptions>( {
      children: [
        new Text( MySolarSystemStrings.velocityStringProperty, TEXT_OPTIONS ),
        new ArrowNode( 95, ARROW_Y_COORDINATE, 140, ARROW_Y_COORDINATE, { fill: PhetColorScheme.VELOCITY } )
      ]
    }, {
      spacing: SPACING
    } ) ), {
      tandem: tandem.createTandem( 'velocityCheckbox' )
    } ),
    new SolarSystemCommonCheckbox( model.valuesVisibleProperty, new Text( MySolarSystemStrings.speedStringProperty, TEXT_OPTIONS ), {
      tandem: tandem.createTandem( 'valuesVisibleCheckbox' )
    } )
  ];
};

solarSystemCommon.register( 'createArrowsVisibilityCheckboxes', createArrowsVisibilityCheckboxes );
export default createArrowsVisibilityCheckboxes;