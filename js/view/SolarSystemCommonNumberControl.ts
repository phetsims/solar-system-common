// Copyright 2023, University of Colorado Boulder

/**
 * Universal slider for SolarSystemCommon
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
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
import ValueChangeSoundPlayer from '../../../tambo/js/sound-generators/ValueChangeSoundPlayer.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';

type SelfOptions = EmptySelfOptions;

export type SolarSystemCommonNumberControlOptions = SelfOptions & NumberControlOptions;

export default class SolarSystemCommonNumberControl extends NumberControl {

  public constructor( valueProperty: Property<number>, range: Range, providedOptions?: SolarSystemCommonNumberControlOptions ) {

    // This mapping function the same as in Greenhouse
    const playbackRateMapper = ( value: number ) => 0.5 + ( range.max - value ) / range.getLength();
    const maxMassSliderSoundClip = new SoundClip( Mass_Slider_Bass_Pluck_mp3, {
      initialPlaybackRate: playbackRateMapper( range.max )
    } );
    const minMassSliderSoundClip = new SoundClip( Mass_Slider_Bass_Pluck_mp3, {
      initialPlaybackRate: playbackRateMapper( range.min )
    } );
    soundManager.addSoundGenerator( maxMassSliderSoundClip );
    soundManager.addSoundGenerator( minMassSliderSoundClip );

    const massSliderSoundClip = new SoundClip( Mass_Slider_Bass_Pluck_mp3 );
    soundManager.addSoundGenerator( massSliderSoundClip );

    const valueChangeSoundGeneratorOptions = {
      middleMovingUpSoundPlayer: massSliderSoundClip,
      middleMovingDownSoundPlayer: massSliderSoundClip,

      minSoundPlayer: minMassSliderSoundClip,
      maxSoundPlayer: maxMassSliderSoundClip,
      middleMovingUpPlaybackRateMapper: playbackRateMapper,

      interThresholdDelta: SolarSystemCommonConstants.SLIDER_STEP - 0.1
    };

    const valueChangeSoundGenerator = new ValueChangeSoundPlayer( range, valueChangeSoundGeneratorOptions );

    const options = optionize<SolarSystemCommonNumberControlOptions, SelfOptions, NumberControlOptions>()( {
      sliderOptions: {
        trackSize: new Dimension2( 226, 2 ),
        thumbSize: new Dimension2( 15, 25 ),
        thumbTouchAreaYDilation: 2,
        thumbCenterLineStroke: 'black',
        trackFillEnabled: SolarSystemCommonColors.foregroundProperty,
        trackStroke: SolarSystemCommonColors.foregroundProperty,
        soundGenerator: valueChangeSoundGenerator,

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
        touchAreaYDilation: 2.5,
        soundPlayer: massSliderSoundClip
      },
      layoutFunction: ( titleNode, numberDisplay, slider, decrementButton, incrementButton ) => {
        assert && assert( decrementButton && incrementButton );
        return new HBox( {
          spacing: 10,
          children: [ decrementButton!, slider, incrementButton! ]
        } );
      }
    }, providedOptions );

    // Unfortunately, NumberControl is hard-coded to require a title, and always creates a titleNode. Therefore
    // we have to pass a title string, even though it will not be displayed due to our custom layout.
    super( '', valueProperty, range, options );
  }

  public override dispose(): void {
    assert && assert( false, 'dispose is not supported, exists for the lifetime of the sim' );
    super.dispose();
  }
}

solarSystemCommon.register( 'SolarSystemCommonNumberControl', SolarSystemCommonNumberControl );