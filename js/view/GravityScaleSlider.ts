// Copyright 2023, University of Colorado Boulder
/**
 * Slider that handles the size of the gravity arrows.
 *
 * @author Agustín Vallejo
 */

import solarSystemCommon from '../solarSystemCommon.js';
import { HBox, RichText, Text, TextOptions } from '../../../scenery/js/imports.js';
import SolarSystemCommonStrings from '../SolarSystemCommonStrings.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import HSlider from '../../../sun/js/HSlider.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import SolarSystemCommonColors from '../SolarSystemCommonColors.js';
import MathSymbols from '../../../scenery-phet/js/MathSymbols.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';

export default class GravityScaleSlider extends HBox {
  public constructor( forceScaleProperty: NumberProperty, gravityVisibleProperty: TReadOnlyProperty<boolean> ) {


    const rangeMin = forceScaleProperty.range.min;
    const rangeMax = forceScaleProperty.range.max;
    const rangeStep = 2;

    // This slider controles the zoom level of the vector arrows
    const slider = new HSlider( forceScaleProperty, forceScaleProperty.range, {
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
      }
    } );

    slider.addMajorTick( rangeMin, new RichText( MathSymbols.TIMES + `10<sup>${rangeMin}</sup`, SolarSystemCommonConstants.TEXT_OPTIONS ) );
    slider.addMajorTick( rangeMax, new RichText( MathSymbols.TIMES + `10<sup>${rangeMax}</sup`, SolarSystemCommonConstants.TEXT_OPTIONS ) );

    for ( let i = 0; i <= 6; i += 2 ) {
      slider.addMinorTick( i );
    }

    super( {
      spacing: 0,
      enabledProperty: gravityVisibleProperty,
      children: [
        new Text( SolarSystemCommonStrings.zoomStringProperty, combineOptions<TextOptions>( {
          maxWidth: SolarSystemCommonConstants.TEXT_MAX_WIDTH / 2,
          layoutOptions: { leftMargin: 20 }
        }, SolarSystemCommonConstants.TEXT_OPTIONS ) ),
        slider
      ]
    } );
  }
}

solarSystemCommon.register( 'GravityScaleSlider', GravityScaleSlider );