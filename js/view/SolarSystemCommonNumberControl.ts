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

export type SolarSystemCommonNumberControlOptions = SelfOptions & NumberControlOptions;

const massSliderSoundClip = new SoundClip( Mass_Slider_Bass_Pluck_mp3 );


soundManager.addSoundGenerator( massSliderSoundClip );

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

    const options = optionize<SolarSystemCommonNumberControlOptions, SelfOptions, NumberControlOptions>()( {
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
          minSoundPlayer: minMassSliderSoundClip,
          maxSoundPlayer: maxMassSliderSoundClip,
          middleMovingUpPlaybackRateMapper: playbackRateMapper
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

    // TODO: double check on constrainValue as it pertains to the arrow buttons. https://github.com/phetsims/my-solar-system/issues/105
    // TODO: keyboard interaction (slider step + arrow buttons) https://github.com/phetsims/my-solar-system/issues/105
    // TODO: slider step https://github.com/phetsims/my-solar-system/issues/105
    // TODO: arrow buttons have default sounds. https://github.com/phetsims/my-solar-system/issues/105

    // Unfortunately, NumberControl is hard-coded to require a title, and always creates a titleNode. Therefore
    // we have to pass a title string, even though it will not be displayed due to our custom layout.
    super( '', valueProperty, range, options );
  }
}

solarSystemCommon.register( 'SolarSystemCommonNumberControl', SolarSystemCommonNumberControl );