// Copyright 2023, University of Colorado Boulder

/**
 * Universal slider for SolarSystemCommon
 *
 * @author Agustín Vallejo
 */

import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Range from '../../../dot/js/Range.js';
import Property from '../../../axon/js/Property.js';
import Mass_Slider_Bass_Pluck_mp3 from '../../sounds/Mass_Slider_Bass_Pluck_mp3.js';
import SoundClip from '../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../tambo/js/soundManager.js';
import SolarSystemCommonColors from '../SolarSystemCommonColors.js';
import solarSystemCommon from '../solarSystemCommon.js';
import SolarSystemCommonStrings from '../SolarSystemCommonStrings.js';
import NumberControl, { NumberControlOptions } from '../../../scenery-phet/js/NumberControl.js';
import { HBox } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';

type SelfOptions = EmptySelfOptions;

export type SolarSystemCommonSliderOptions = SelfOptions & NumberControlOptions;

const massSliderSoundClip = new SoundClip( Mass_Slider_Bass_Pluck_mp3 );

soundManager.addSoundGenerator( massSliderSoundClip );

export default class SolarSystemCommonSlider extends NumberControl {

  public constructor( valueProperty: Property<number>, range: Range, providedOptions?: SolarSystemCommonSliderOptions ) {
    const options = optionize<SolarSystemCommonSliderOptions, SelfOptions, NumberControlOptions>()( {
      sliderOptions: {

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
          interThresholdDelta: null,
          // This mapping function the same as in Greenhouse
          middleMovingUpPlaybackRateMapper: ( value: number ) => 0.5 + ( range.max - value ) / range.getLength()
        },

        //a11y
        accessibleName: SolarSystemCommonStrings.a11y.massSliderStringProperty
      },
      titleNodeOptions: {
        tandem: Tandem.OPT_OUT
      },
      numberDisplayOptions: {
        tandem: Tandem.OPT_OUT
      },
      arrowButtonOptions: {
        baseColor: 'white',
        stroke: 'black',
        lineWidth: 1,
        scale: 0.8,
        touchAreaYDilation: 2.5
      },
      layoutFunction: ( titleNode, numberDisplay, slider, decrementButton, incrementButton ) => {
        assert && assert( decrementButton && incrementButton );
        return new HBox( {
          spacing: 10,
          children: [ decrementButton!, slider, incrementButton! ]
        } );
      }
    }, providedOptions );

    // TODO: title is '', can this be better? https://github.com/phetsims/my-solar-system/issues/105
    // TODO: double check on constrainValue as it pertains to the arrow buttons. https://github.com/phetsims/my-solar-system/issues/105
    // TODO: last two sounds are the same deepness. https://github.com/phetsims/my-solar-system/issues/105
    // TODO: keyboard interaction (slider step + arrow buttons) https://github.com/phetsims/my-solar-system/issues/105
    // TODO: slider step https://github.com/phetsims/my-solar-system/issues/105
    // TODO: arrow buttons have default sounds. https://github.com/phetsims/my-solar-system/issues/105
    // TODO: Rename from "Slider" type, https://github.com/phetsims/my-solar-system/issues/105

    super( '', valueProperty, range, options );
  }
}

solarSystemCommon.register( 'SolarSystemCommonSlider', SolarSystemCommonSlider );