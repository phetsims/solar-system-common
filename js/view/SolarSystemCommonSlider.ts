// Copyright 2023, University of Colorado Boulder

/**
 * Universal slider for SolarSystemCommon
 * 
 * @author Agustín Vallejo
 */

import HSlider, { HSliderOptions } from '../../../sun/js/HSlider.js';
import optionize, { combineOptions, EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Range from '../../../dot/js/Range.js';
import Property from '../../../axon/js/Property.js';
import Mass_Slider_Bass_Pluck_mp3 from '../../sounds/Mass_Slider_Bass_Pluck_mp3.js';
import SoundClip from '../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../tambo/js/soundManager.js';
import SolarSystemCommonColors from '../SolarSystemCommonColors.js';
import solarSystemCommon from '../solarSystemCommon.js';
import SolarSystemCommonStrings from '../SolarSystemCommonStrings.js';
import { HBox } from '../../../scenery/js/imports.js';
import ArrowButton, { ArrowButtonOptions } from '../../../sun/js/buttons/ArrowButton.js';
import RangeWithValue from '../../../dot/js/RangeWithValue.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';

type SelfOptions = EmptySelfOptions;

export type SolarSystemCommonSliderOptions = SelfOptions & HSliderOptions;

const massSliderSoundClip = new SoundClip( Mass_Slider_Bass_Pluck_mp3 );

soundManager.addSoundGenerator( massSliderSoundClip );

export default class SolarSystemCommonSlider extends HBox {
  public slider: HSlider;

  public constructor( valueProperty: Property<number>, range: Range, providedOptions?: SolarSystemCommonSliderOptions ) {
    const options = optionize<SolarSystemCommonSliderOptions, SelfOptions, HSliderOptions>()( {
      trackSize: new Dimension2( 226, 2 ),
      thumbSize: new Dimension2( 15, 25 ),
      thumbTouchAreaYDilation: 2,
      thumbCenterLineStroke: 'black',
      trackFillEnabled: SolarSystemCommonColors.foregroundProperty,
      trackStroke: SolarSystemCommonColors.foregroundProperty,
      valueChangeSoundGeneratorOptions: {
        middleMovingUpSoundPlayer: massSliderSoundClip,
        middleMovingDownSoundPlayer: massSliderSoundClip,
        minSoundPlayer: massSliderSoundClip,
        maxSoundPlayer: massSliderSoundClip,
        numberOfMiddleThresholds: 10,
        // This mapping function the same as in Greenhouse
        middleMovingUpPlaybackRateMapper: ( value: number ) => 0.5 + ( range.max - value ) / range.getLength()
      },

      //a11y
      accessibleName: SolarSystemCommonStrings.a11y.massSliderStringProperty

    }, providedOptions );

    const slider = new HSlider( valueProperty, range, options );

    const divisionsRange = new RangeWithValue( range.min, range.max, valueProperty.value );

    const arrowButtonOptions: ArrowButtonOptions = {
      baseColor: 'white',
      stroke: 'black',
      lineWidth: 1,
      scale: 0.8
    };

    // increment button
    const incrementButton = new ArrowButton(
      'right',
      () => {
        const numberValue = valueProperty.value;
        valueProperty.value =
          numberValue < divisionsRange.max ?
          numberValue + 1 :
          numberValue;
      },
      combineOptions<ArrowButtonOptions>( {
        accessibleName: SolarSystemCommonStrings.a11y.increaseStringProperty,
        enabledProperty: new DerivedProperty(
          [ valueProperty ],
          periodDivisions => {
            return periodDivisions < divisionsRange.max;
          }
        )
      }, arrowButtonOptions )
    );

    // decrement button
    const decrementButton = new ArrowButton(
      'left',
      () => {
        const numberValue = valueProperty.value;
        valueProperty.value =
          numberValue > divisionsRange.min ?
          numberValue - 1 :
          numberValue;
      },
      combineOptions<ArrowButtonOptions>( {
        accessibleName: SolarSystemCommonStrings.a11y.decreaseStringProperty,
        enabledProperty: new DerivedProperty(
          [ valueProperty ],
          periodDivisions => {
            return periodDivisions > divisionsRange.min;
          }
        )
      }, arrowButtonOptions )
    );


    super( {
      spacing: 10,
      children: [ decrementButton, slider, incrementButton ]
    } );

    this.slider = slider;
  }
}

solarSystemCommon.register( 'SolarSystemCommonSlider', SolarSystemCommonSlider );