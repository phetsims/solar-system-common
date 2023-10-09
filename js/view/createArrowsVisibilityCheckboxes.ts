// Copyright 2023, University of Colorado Boulder


/**
 * Visual representation of velocity and gravity arrows checkbox.
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import ArrowNode from '../../../scenery-phet/js/ArrowNode.js';
import { HBox, Text, TextOptions } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import SolarSystemCommonStrings from '../../../solar-system-common/js/SolarSystemCommonStrings.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';
import SolarSystemCommonCheckbox from './SolarSystemCommonCheckbox.js';
import solarSystemCommon from '../solarSystemCommon.js';
import SolarSystemCommonColors from '../SolarSystemCommonColors.js';
import VisibleProperties from './VisibleProperties.js';

// constants
const ARROW_Y_COORDINATE = -10;

const TEXT_OPTIONS = combineOptions<TextOptions>( {}, SolarSystemCommonConstants.TEXT_OPTIONS, {
  maxWidth: SolarSystemCommonConstants.CHECKBOX_TEXT_MAX_WIDTH
} );

const SPACING = 10;

/**
 * Creates checkboxes that change the visibility of the velocity and gravity arrows.
 */
const createArrowsVisibilityCheckboxes = ( visibleProperties: VisibleProperties, tandem: Tandem ): SolarSystemCommonCheckbox[] => {
  return [
    // speed checkbox
    new SolarSystemCommonCheckbox( visibleProperties.speedVisibleProperty, new Text( SolarSystemCommonStrings.speedStringProperty, TEXT_OPTIONS ), {
      accessibleName: SolarSystemCommonStrings.speedStringProperty,
      tandem: tandem.createTandem( 'valuesVisibleCheckbox' )
    } ),
    // velocity checkbox
    new SolarSystemCommonCheckbox( visibleProperties.velocityVisibleProperty, new HBox( {
      spacing: SPACING,
      children: [
        new Text( SolarSystemCommonStrings.velocityStringProperty, TEXT_OPTIONS ),
        new ArrowNode( 95, ARROW_Y_COORDINATE, 140, ARROW_Y_COORDINATE, { fill: SolarSystemCommonColors.velocityColorProperty } )
      ]
    } ), {
      accessibleName: SolarSystemCommonStrings.velocityStringProperty,
      tandem: tandem.createTandem( 'velocityCheckbox' )
    } ),
    // gravity force checkbox
    new SolarSystemCommonCheckbox( visibleProperties.gravityVisibleProperty, new HBox( {
      spacing: SPACING,
      children: [
        new Text( SolarSystemCommonStrings.gravityForceStringProperty, TEXT_OPTIONS ),
        new ArrowNode( 135, ARROW_Y_COORDINATE, 180, ARROW_Y_COORDINATE, { fill: SolarSystemCommonColors.gravityColorProperty } )
      ]
    } ), {
      accessibleName: SolarSystemCommonStrings.gravityForceStringProperty,
      tandem: tandem.createTandem( 'gravityForceCheckbox' )
    } )
  ];
};

solarSystemCommon.register( 'createArrowsVisibilityCheckboxes', createArrowsVisibilityCheckboxes );
export default createArrowsVisibilityCheckboxes;