// Copyright 2023, University of Colorado Boulder

/**
 * Visible Body Node that draws a sphere with size dependent on the Body's mass.
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import { Color, DragListener, InteractiveHighlighting, KeyboardDragListener, Node, Rectangle, RectangleOptions, RichText, TextOptions } from '../../../scenery/js/imports.js';
import Utils from '../../../dot/js/Utils.js';
import Body from '../model/Body.js';
import ShadedSphereNode, { ShadedSphereNodeOptions } from '../../../scenery-phet/js/ShadedSphereNode.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import optionize from '../../../phet-core/js/optionize.js';
import Multilink from '../../../axon/js/Multilink.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import SolarSystemCommonStrings from '../../../solar-system-common/js/SolarSystemCommonStrings.js';
import Vector2 from '../../../dot/js/Vector2.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import PatternStringProperty from '../../../axon/js/PatternStringProperty.js';
import ExplosionNode from './ExplosionNode.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import { Shape } from '../../../kite/js/imports.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';
import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import solarSystemCommon from '../solarSystemCommon.js';
import Bodies_Brass_C3_mp3 from '../../sounds/Bodies_Brass_C3_mp3.js';
import Bodies_Flute_g3_mp3 from '../../sounds/Bodies_Flute_g3_mp3.js';
import Bodies_Strings_e3_v2_mp3 from '../../sounds/Bodies_Strings_e3_v2_mp3.js';
import Bodies_Woodwinds_e3_mp3 from '../../sounds/Bodies_Woodwinds_e3_mp3.js';
import Grab_Sound_mp3 from '../../sounds/Grab_Sound_mp3.js';
import Release_Sound_mp3 from '../../sounds/Release_Sound_mp3.js';
import SoundClip from '../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../tambo/js/soundManager.js';
import CueingArrowsNode from './CueingArrowsNode.js';
import WithRequired from '../../../phet-core/js/types/WithRequired.js';

const bodySounds = [
  Bodies_Brass_C3_mp3,
  Bodies_Woodwinds_e3_mp3,
  Bodies_Strings_e3_v2_mp3,
  Bodies_Flute_g3_mp3
];

// Defaults to speed not visible. PhET-iO instrumentation is not needed.
const DEFAULT_SPEED_VISIBLE_PROPERTY = new BooleanProperty( false );

type SelfOptions = {
  draggable?: boolean;

  // Velocities for keyboard drag controls
  dragVelocity?: number;
  shiftDragVelocity?: number;

  // Function to constrain the potential drag position of the body
  mapPosition?: ( position: Vector2, radius: number ) => Vector2;
  speedVisibleProperty?: TReadOnlyProperty<boolean>;

  // Options for the speed display rectangle
  rectangleOptions?: RectangleOptions;
  textOptions?: TextOptions;

  // Visible property for the cueing arrows
  cueingArrowsVisibleProperty?: TReadOnlyProperty<boolean> | null;

  showVelocityIndex?: boolean;

  // If a soundViewNode is provided, we'll hook up a soundClip to it and play sounds when it is visible
  soundViewNode?: Node | null;
};

export type BodyNodeOptions = SelfOptions & WithRequired<StrictOmit<ShadedSphereNodeOptions, 'cursor'>, 'tandem'>;

export default class BodyNode extends InteractiveHighlighting( ShadedSphereNode ) {

  public readonly body: Body;
  public readonly soundClip: SoundClip;
  public readonly grabClip: SoundClip;
  public readonly releaseClip: SoundClip;

  public constructor( body: Body,
                      modelViewTransformProperty: TReadOnlyProperty<ModelViewTransform2>,
                      providedOptions?: BodyNodeOptions ) {
    const accessibleName = `Body ${body.index}`;

    const options = optionize<BodyNodeOptions, SelfOptions, ShadedSphereNodeOptions>()( {

      // SelfOptions
      draggable: true,
      dragVelocity: 450,
      shiftDragVelocity: 100,
      mapPosition: _.identity,
      speedVisibleProperty: DEFAULT_SPEED_VISIBLE_PROPERTY,
      rectangleOptions: {
        cornerRadius: 2,
        fill: new Color( 0, 0, 0, 0.5 )
      },
      textOptions: {
        fill: 'white', // Not a colorProperty because it is not dynamic
        maxWidth: 200,
        font: new PhetFont( 16 )
      },
      cueingArrowsVisibleProperty: null,
      showVelocityIndex: true,
      soundViewNode: null,

      // ShadedSphereNodeOptions
      isDisposable: false, // see https://github.com/phetsims/my-solar-system/issues/230
      mainColor: body.colorProperty,

      // pdom
      tagName: 'div',
      focusable: true,
      ariaLabel: accessibleName, // the screen reader Accessible Name
      innerContent: accessibleName, // needed to make it focusable in the PDOM
      ariaRole: 'application',

      // phet-io
      phetioFeatured: true,
      phetioInputEnabledPropertyInstrumented: true, // see https://github.com/phetsims/my-solar-system/issues/231
      inputEnabledPropertyOptions: {
        phetioFeatured: true
      }
    }, providedOptions );

    options.cursor = options.draggable ? 'pointer' : 'default';

    super( 1, options );

    this.body = body;

    this.soundClip = new SoundClip( bodySounds[ body.index - 1 ], {
      initialOutputLevel: SolarSystemCommonConstants.DEFAULT_SOUND_OUTPUT_LEVEL / 2,
      loop: true
    } );

    const dragClipOptions = {
      initialOutputLevel: SolarSystemCommonConstants.DEFAULT_SOUND_OUTPUT_LEVEL
    };
    this.grabClip = new SoundClip( Grab_Sound_mp3, dragClipOptions );
    this.releaseClip = new SoundClip( Release_Sound_mp3, dragClipOptions );

    if ( options.soundViewNode ) {
      soundManager.addSoundGenerator( this.soundClip, {
        associatedViewNode: options.soundViewNode
      } );
      soundManager.addSoundGenerator( this.grabClip, {
        associatedViewNode: options.soundViewNode
      } );
      soundManager.addSoundGenerator( this.releaseClip, {
        associatedViewNode: options.soundViewNode
      } );
    }

    Multilink.multilink(
      [ body.radiusProperty, modelViewTransformProperty ],
      ( radius, modelViewTransform ) => {
        this.radius = modelViewTransform.modelToViewDeltaX( radius );
        // Expand mouse/touch areas to 10 units past
        const area = Shape.circle( 0, 0, this.radius + 10 );
        this.mouseArea = area;
        this.touchArea = area;
        this.focusHighlight = area;
      } );

    Multilink.multilink(
      [ body.positionProperty, modelViewTransformProperty ],
      ( position, modelViewTransform ) => {
        this.translation = modelViewTransform.modelToViewPosition( position );

        // If body position is bigger than the provided bounds
        this.body.isOffscreenProperty.value = body.positionProperty.value.magnitude > options.mapPosition( body.positionProperty.value, this.radius ).magnitude;
      } );

    if ( options.draggable ) {
      const start = () => {
        body.clearPath();
        body.userIsControllingPositionProperty.value = true;
        this.grabClip.play();
      };
      const end = () => {
        body.userIsControllingPositionProperty.value = false;
        this.releaseClip.play();
      };

      // Constrain dragging for DragListener and KeyboardDragListener.
      const map = ( point: Vector2 ) => options.mapPosition( point, this.radius );

      const dragListener = new DragListener( {
        positionProperty: body.positionProperty,
        transform: modelViewTransformProperty,
        mapPosition: map,
        start: start,
        end: end,
        canStartPress: () => !body.userIsControllingPositionProperty.value,
        tandem: options.tandem.createTandem( 'dragListener' )
      } );
      this.addInputListener( dragListener );

      const keyboardDragListener = new KeyboardDragListener( {
        positionProperty: body.positionProperty,
        transform: modelViewTransformProperty,
        mapPosition: map,
        start: start,
        end: end,
        dragVelocity: options.dragVelocity,
        shiftDragVelocity: options.shiftDragVelocity,
        tandem: options.tandem.createTandem( 'keyboardDragListener' )
      } );
      this.addInputListener( keyboardDragListener );
    }

    // Format the speed with units.
    const speedStringProperty = new PatternStringProperty( SolarSystemCommonStrings.pattern.velocityValueUnitsStringProperty, {
      index: options.showVelocityIndex ? body.index : '',
      value: new DerivedProperty( [ this.body.speedProperty ], speed => Utils.toFixed( speed, 2 ) ),
      units: SolarSystemCommonStrings.units.kmsStringProperty
    } );

    const speedText = new RichText( speedStringProperty, options.textOptions );

    // Dynamically size the background to fit the text.
    const speedBackgroundNode = new Rectangle( options.rectangleOptions );
    speedText.boundsProperty.link( bounds => {
      speedBackgroundNode.rectBounds = bounds.dilated( 4 );
    } );

    // Put the parts of the speed display together
    const speedDisplay = new Node( {
      children: [ speedBackgroundNode, speedText ],
      visibleProperty: options.speedVisibleProperty,
      center: new Vector2( 0, 30 )
    } );
    this.addChild( speedDisplay );

    this.body.velocityProperty.link( velocity => {
      speedDisplay.center = new Vector2( 0, velocity.y > 0 ? 30 : -30 );
    } );

    const bodyCollisionListener = () => {
      this.interruptSubtreeInput();
      ExplosionNode.explode( this );
    };

    this.body.collidedEmitter.addListener( bodyCollisionListener );

    // Optional cueing arrows
    if ( options.cueingArrowsVisibleProperty ) {
      const cueingArrowsNode = new CueingArrowsNode( {
        bodyRadius: this.radius,
        fill: options.mainColor,
        visibleProperty: options.cueingArrowsVisibleProperty
      } );
      this.addChild( cueingArrowsNode );
    }

    this.addLinkedElement( body, {
      tandemName: 'body' // so that all BodyNode elements have the same linked element name
    } );

    // Stop sound when the associated Body becomes inactive.
    body.isActiveProperty.link( isActive => !isActive && this.stopSound() );

    this.body.accelerationProperty.link( acceleration => {
      this.soundClip.setOutputLevel( acceleration.magnitude / 2000 );
    } );
  }

  public playSound(): void {
    if ( this.body.isActiveProperty.value ) {
      this.soundClip.play();
    }
    else {
      this.soundClip.stop();
    }
  }

  public stopSound(): void {
    this.soundClip.stop();
  }
}

solarSystemCommon.register( 'BodyNode', BodyNode );