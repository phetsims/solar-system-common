// Copyright 2023, University of Colorado Boulder

/**
 * GravityZoomControl is the control for scaling the size of the gravity arrows. It is a labeled slider.
 *
 * @author Agustín Vallejo
 */

import solarSystemCommon from '../solarSystemCommon.js';
import { HBox, RichText, RichTextOptions, Text } from '../../../scenery/js/imports.js';
import SolarSystemCommonStrings from '../SolarSystemCommonStrings.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import HSlider from '../../../sun/js/HSlider.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import SolarSystemCommonColors from '../SolarSystemCommonColors.js';
import MathSymbols from '../../../scenery-phet/js/MathSymbols.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Tandem from '../../../tandem/js/Tandem.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';

const TICK_MARK_OPTIONS: RichTextOptions = {
  font: new PhetFont( 16 ),
  fill: SolarSystemCommonColors.foregroundProperty
};

export default class GravityZoomControl extends HBox {

  public constructor( gravityForceScalePowerProperty: NumberProperty, gravityVisibleProperty: TReadOnlyProperty<boolean>, tandem: Tandem ) {

    const zoomText = new Text( SolarSystemCommonStrings.zoomStringProperty, {
      font: new PhetFont( 16 ),
      fill: SolarSystemCommonColors.foregroundProperty,
      layoutOptions: { leftMargin: 20 },
      maxWidth: 100
    } );

    const rangeMin = gravityForceScalePowerProperty.range.min;
    const rangeMax = gravityForceScalePowerProperty.range.max;
    const rangeStep = 2;

    // This slider controls the zoom level of the vector arrows
    const slider = new HSlider( gravityForceScalePowerProperty, gravityForceScalePowerProperty.range, {
      trackSize: new Dimension2( 100, 4 ),
      thumbSize: new Dimension2( 14, 28 ),
      tickLabelSpacing: 3,
      constrainValue: ( power: number ) => Math.abs( power ) < 0.5 ? 0 : power,
      shiftKeyboardStep: 0.5,
      keyboardStep: 1,
      pageKeyboardStep: 2,
      trackFillEnabled: SolarSystemCommonColors.foregroundProperty,
      majorTickStroke: SolarSystemCommonColors.foregroundProperty,
      majorTickLength: 8,
      minorTickLength: 8,
      minorTickStroke: SolarSystemCommonColors.foregroundProperty,
      accessibleName: SolarSystemCommonStrings.a11y.scaleSliderStringProperty,
      valueChangeSoundGeneratorOptions: {
        numberOfMiddleThresholds: ( rangeMax - rangeMin ) / rangeStep - 1
      },
      tandem: tandem.createTandem( 'slider' ),
      phetioVisiblePropertyInstrumented: false
    } );

    slider.addMajorTick( rangeMin, new RichText( MathSymbols.TIMES + `10<sup>${rangeMin}</sup`, TICK_MARK_OPTIONS ) );
    slider.addMajorTick( rangeMax, new RichText( MathSymbols.TIMES + `10<sup>${rangeMax}</sup`, TICK_MARK_OPTIONS ) );

    for ( let i = 0; i <= 6; i += 2 ) {
      slider.addMinorTick( i );
    }

    super( {
      spacing: 0,
      enabledProperty: gravityVisibleProperty,
      children: [ zoomText, slider ]
    } );
  }
}

solarSystemCommon.register( 'GravityZoomControl', GravityZoomControl );