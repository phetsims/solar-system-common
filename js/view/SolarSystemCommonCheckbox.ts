// Copyright 2023, University of Colorado Boulder

/**
 * Checkbox with common options for the my-solar-system and keplers-laws sims
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import Checkbox, { CheckboxOptions } from '../../../sun/js/Checkbox.js';
import { EmptySelfOptions, optionize4 } from '../../../phet-core/js/optionize.js';
import { Node } from '../../../scenery/js/imports.js';
import Property from '../../../axon/js/Property.js';
import solarSystemCommon from '../solarSystemCommon.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';

type SelfOptions = EmptySelfOptions;

type SolarSystemCommonCheckboxOptions = SelfOptions & CheckboxOptions;

export default class SolarSystemCommonCheckbox extends Checkbox {

  public constructor( property: Property<boolean>, content: Node, providedOptions?: SolarSystemCommonCheckboxOptions ) {

    const options = optionize4<SolarSystemCommonCheckboxOptions, SelfOptions, CheckboxOptions>()(
      {}, SolarSystemCommonConstants.CHECKBOX_OPTIONS, {

        // CheckboxOptions
        touchAreaXDilation: 5,
        touchAreaYDilation: SolarSystemCommonConstants.CHECKBOX_SPACING / 2,
        containerTagName: 'div' // Just for easier visualization in a11y view
      }, providedOptions );

    super( property, content, options );
  }
}

solarSystemCommon.register( 'SolarSystemCommonCheckbox', SolarSystemCommonCheckbox );
