// Copyright 2023-2024, University of Colorado Boulder

/**
 * SolarSystemCommonMeasuringTapeNode is the specialization of MeasuringTapeNode using in sims that depend on
 * solar-system-common.
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import MeasuringTapeNode from '../../../scenery-phet/js/MeasuringTapeNode.js';
import SolarSystemCommonMeasuringTape from '../model/SolarSystemCommonMeasuringTape.js';
import Tandem from '../../../tandem/js/Tandem.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';
import SoundClip from '../../../tambo/js/sound-generators/SoundClip.js';
import Grab_Sound_mp3 from '../../sounds/Grab_Sound_mp3.js';
import Release_Sound_mp3 from '../../sounds/Release_Sound_mp3.js';
import solarSystemCommon from '../solarSystemCommon.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import SolarSystemCommonStrings from '../SolarSystemCommonStrings.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import soundManager from '../../../tambo/js/soundManager.js';
import Multilink from '../../../axon/js/Multilink.js';

export default class SolarSystemCommonMeasuringTapeNode extends MeasuringTapeNode {

  public constructor( measuringTape: SolarSystemCommonMeasuringTape,
                      visibleProperty: TReadOnlyProperty<boolean>,
                      visibleBoundsProperty: TReadOnlyProperty<Bounds2>,
                      modelViewTransformProperty: TReadOnlyProperty<ModelViewTransform2>,
                      tandem: Tandem ) {

    // Sounds for grab and release interactions
    const dragClipOptions = {
      initialOutputLevel: SolarSystemCommonConstants.DEFAULT_SOUND_OUTPUT_LEVEL
    };
    const grabClip = new SoundClip( Grab_Sound_mp3, dragClipOptions );
    const releaseClip = new SoundClip( Release_Sound_mp3, dragClipOptions );
    soundManager.addSoundGenerator( grabClip );
    soundManager.addSoundGenerator( releaseClip );

    // Units must update dynamically when AUStringProperty changes.
    const unitsProperty = new DerivedProperty( [ SolarSystemCommonStrings.units.AUStringProperty ],
      AUString => {
        return { name: AUString, multiplier: 1 };
      } );

    super( unitsProperty, {
      basePositionProperty: measuringTape.basePositionProperty,
      tipPositionProperty: measuringTape.tipPositionProperty,
      visibleProperty: visibleProperty,
      textColor: 'black',
      textBackgroundColor: 'rgba( 255, 255, 255, 0.5 )', // translucent white
      textBackgroundXMargin: 10,
      textBackgroundYMargin: 3,
      textBackgroundCornerRadius: 5,
      significantFigures: 2,
      baseDragStarted: () => grabClip.play(),
      baseDragEnded: () => releaseClip.play(),
      keyboardDragListenerOptions: {
        baseShiftDragSpeed: 100,
        tipShiftDragSpeed: 100
      },
      tandem: tandem,
      phetioFeatured: true,
      phetioReadoutStringPropertyInstrumented: false,
      phetioFeaturedMeasuredDistanceProperty: true
    } );

    this.addLinkedElement( measuringTape );

    // Constrain dragging to visibleBounds.
    Multilink.multilink(
      [ visibleBoundsProperty, modelViewTransformProperty ],
      ( visibleBounds, modelViewTransform ) => {
        this.setDragBounds( modelViewTransform.viewToModelBounds( visibleBounds.eroded( 10 ) ) );
        this.modelViewTransformProperty.value = modelViewTransform;
      }
    );
  }
}

solarSystemCommon.register( 'SolarSystemCommonMeasuringTapeNode', SolarSystemCommonMeasuringTapeNode );