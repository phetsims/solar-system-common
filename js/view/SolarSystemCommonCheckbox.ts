// Copyright 2023, University of Colorado Boulder

/**
 * Checkbox with common options for the my-solar-system and keplers-laws sims
 *
 * @author Agustín Vallejo
 */

import Checkbox, { CheckboxOptions } from '../../../sun/js/Checkbox.js';
import SolarSystemCommonColors from '../SolarSystemCommonColors.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
import { Node } from '../../../scenery/js/imports.js';
import Property from '../../../axon/js/Property.js';
import solarSystemCommon from '../solarSystemCommon.js';

export default class SolarSystemCommonCheckbox extends Checkbox {

  public constructor( property: Property<boolean>, content: Node, providedOptions?: CheckboxOptions ) {
    super( property, content, combineOptions<CheckboxOptions>( {
      boxWidth: 14,
      checkboxColor: SolarSystemCommonColors.foregroundProperty,
      checkboxColorBackground: SolarSystemCommonColors.backgroundProperty,
      touchAreaXDilation: 5,
      touchAreaYDilation: 2.5 //REVIEW: Have this be half of the spacing between the checkboxes (programmatically)
    }, providedOptions ) );
  }
}

solarSystemCommon.register( 'SolarSystemCommonCheckbox', SolarSystemCommonCheckbox );
