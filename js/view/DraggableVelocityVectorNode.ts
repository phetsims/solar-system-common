// Copyright 2023-2024, University of Colorado Boulder

/**
 * Used to show the draggable velocity vectors.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import { Shape } from '../../../kite/js/imports.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { Color, InteractiveHighlighting, Node, Path, PathOptions, Text } from '../../../scenery/js/imports.js';
import VectorNode, { VectorNodeOptions } from './VectorNode.js';
import Body from '../model/Body.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import solarSystemCommon from '../solarSystemCommon.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';
import SolarSystemCommonStrings from '../SolarSystemCommonStrings.js';
import SolarSystemCommonColors from '../SolarSystemCommonColors.js';
import WithRequired from '../../../phet-core/js/types/WithRequired.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import RichPointerDragListener, { RichPointerDragListenerOptions } from '../../../scenery-phet/js/RichPointerDragListener.js';
import RichKeyboardDragListener, { RichKeyboardDragListenerOptions } from '../../../scenery-phet/js/RichKeyboardDragListener.js';

type SelfOptions = {
  snapToZero?: boolean; // When the user sets the vector's magnitude to less than minimumMagnitude, it snaps to zero
  minimumMagnitude?: number; // The minimum magnitude of the vector
  maxMagnitudeProperty?: TReadOnlyProperty<number> | null;

  // If a soundViewNode is provided, we'll hook up a soundClip to it and play sounds when it is visible
  soundViewNode?: Node | null;

  // For drag "bounds"-like handling
  mapPosition?: ( position: Vector2, radius: number ) => Vector2;

  // Speeds for keyboard drag controls
  dragSpeed?: number;
  shiftDragSpeed?: number;

  // Custom property that isn't linked to inputEnabledProperty
  isVelocityInteractiveProperty?: TReadOnlyProperty<boolean>;
};

export type DraggableVectorNodeOptions = SelfOptions &
  WithRequired<VectorNodeOptions, 'tandem' | 'visibleProperty'>;

export default class DraggableVelocityVectorNode extends VectorNode {

  public constructor( body: Body, transformProperty: TReadOnlyProperty<ModelViewTransform2>, providedOptions?: DraggableVectorNodeOptions ) {

    const options = optionize<DraggableVectorNodeOptions, SelfOptions, VectorNodeOptions>()( {

      // SelfOptions
      snapToZero: true,
      minimumMagnitude: 2.11,
      maxMagnitudeProperty: null,
      soundViewNode: null,
      mapPosition: _.identity,
      dragSpeed: 450,
      shiftDragSpeed: 100,
      fill: SolarSystemCommonColors.velocityColorProperty,

      // VectorNodeOptions
      isDisposable: false, // see https://github.com/phetsims/my-solar-system/issues/230
      phetioFeatured: true,
      phetioInputEnabledPropertyInstrumented: true, // see https://github.com/phetsims/my-solar-system/issues/231
      inputEnabledPropertyOptions: {
        phetioFeatured: true
      },

      isVelocityInteractiveProperty: new BooleanProperty( true )
    }, providedOptions );

    const positionProperty = body.positionProperty;
    const velocityProperty = body.velocityProperty;

    // Constants, does not require PhET-iO instrumentation.
    const vectorScalePowerProperty = new NumberProperty( 0 );

    super( body, transformProperty, velocityProperty, vectorScalePowerProperty, options );

    const circleRadius = 18;
    const circleLineWidth = 3;
    const circleOuterRadius = circleRadius + circleLineWidth / 2;

    const accessibleName = `Velocity Body ${body.index}`;

    // a circle with text (a character) in the center, to help indicate what it represents
    // ("v" for velocity in this sim)
    const grabArea = new InteractivePath( Shape.circle( 0, 0, circleRadius ), {
      lineWidth: circleLineWidth,
      stroke: Color.lightGray,
      cursor: 'pointer',

      // pdom
      tagName: 'div',
      focusable: true,
      ariaLabel: accessibleName, // the screen reader Accessible Name
      innerContent: accessibleName, // needed to make it focusable in the PDOM
      ariaRole: 'application',
      focusHighlight: Shape.circle( 0, 0, circleRadius * 1.3 )
    } );

    const labelText = new Text( SolarSystemCommonStrings.VStringProperty, {
      font: new PhetFont( { size: 22, weight: 'bold' } ),
      fill: Color.gray,
      maxWidth: 25
    } );
    this.tipPositionProperty.link( tip => {
      labelText.center = tip;
      grabArea.center = tip;
    } );

    this.addChild( grabArea );
    this.addChild( labelText );

    // This represents the model coordinates of where the 'V' circle appears, it is linked down below.
    // PhET-iO instrumentation is not needed, as this Property is controlled solely by DragListener
    // and KeyboardDragListener, and changes made to it resulted in changes to other stateful Properties.
    const velocityCirclePositionProperty = new Vector2Property( transformProperty.value.viewToModelPosition( this.tipPositionProperty.value ) );

    // Add the drag handler
    const start = () => {
      body.userIsControllingVelocityProperty.value = true;
    };
    const end = () => {
      body.userIsControllingVelocityProperty.value = false;
    };

    const soundClipOptions = {
      initialOutputLevel: SolarSystemCommonConstants.DEFAULT_SOUND_OUTPUT_LEVEL
    };
    const richDragListenerOptions = {
      grabSoundClipOptions: soundClipOptions,
      releaseSoundClipOptions: soundClipOptions
    };

    const dragListener = new RichPointerDragListener( combineOptions<RichPointerDragListenerOptions>( {
      positionProperty: velocityCirclePositionProperty,
      transform: transformProperty,
      mapPosition: point => options.mapPosition( point, circleOuterRadius ),
      start: () => {
        keyboardDragListener.interrupt();
        start();
      },
      end: end,
      canStartPress: () => !body.userIsControllingVelocityProperty.value,
      tandem: options.tandem.createTandem( 'dragListener' )
    }, richDragListenerOptions ) );
    grabArea.addInputListener( dragListener );

    // Move behind the geometry created by the superclass.
    grabArea.moveToBack();
    labelText.moveToBack();

    const keyboardDragListener = new RichKeyboardDragListener( combineOptions<RichKeyboardDragListenerOptions>( {
      positionProperty: velocityCirclePositionProperty,
      transform: transformProperty,
      mapPosition: point => options.mapPosition( point, circleOuterRadius ),
      start: () => {
        dragListener.interrupt();
        start();
      },
      end: end,
      shiftDragSpeed: options.shiftDragSpeed,
      dragSpeed: options.dragSpeed,
      tandem: options.tandem.createTandem( 'keyboardDragListener' )
    }, richDragListenerOptions ) );
    this.addInputListener( keyboardDragListener );

    // If this Node becomes invisible, interrupt user interaction.
    this.visibleProperty.lazyLink( visible => {
      if ( !visible ) {
        this.interruptSubtreeInput();
      }
    } );

    const internalEnabledProperty = new DerivedProperty( [ options.isVelocityInteractiveProperty, this.inputEnabledProperty ],
      ( interactive, inputEnabled ) => interactive && inputEnabled );

    // If DraggableVector is disabled, don't show the drag circle.
    internalEnabledProperty.link( enabled => {
      grabArea.visible = enabled;
      labelText.visible = enabled;
    } );

    // Workaround for https://github.com/phetsims/my-solar-system/issues/278#issuecomment-1806360130
    let changingByPosition = false;

    // Updating the velocity position when the body's position changes
    positionProperty.link( position => {
      changingByPosition = true;
      velocityCirclePositionProperty.value = position.plus( velocityProperty.value.times( SolarSystemCommonConstants.VELOCITY_TO_VIEW_MULTIPLIER ) );
      changingByPosition = false;
    } );

    velocityCirclePositionProperty.lazyLink( velocityCirclePosition => {
      if ( !changingByPosition ) {
        // The velocity is obtained by scaling down the view velocity arrow by the VELOCITY_TO_VIEW_MULTIPLIER
        const newVelocity = velocityCirclePosition.minus( positionProperty.value ).dividedScalar( SolarSystemCommonConstants.VELOCITY_TO_VIEW_MULTIPLIER );

        if ( newVelocity.magnitude < options.minimumMagnitude ) {
          if ( options.snapToZero ) {
            newVelocity.setXY( 0, 0 ); // Not using setMagnitude because newVelocity could already be a 0 vector.
          }
          else {
            newVelocity.setMagnitude( options.minimumMagnitude );
          }
        }
        else if ( options.maxMagnitudeProperty && newVelocity.magnitude > options.maxMagnitudeProperty.value ) {
          newVelocity.setMagnitude( options.maxMagnitudeProperty.value );
        }

        velocityProperty.value = newVelocity;
      }
    } );
  }
}

class InteractivePath extends InteractiveHighlighting( Path ) {
  public constructor( shape: Shape, options?: PathOptions ) {
    super( shape, options );
  }
}

solarSystemCommon.register( 'DraggableVelocityVectorNode', DraggableVelocityVectorNode );