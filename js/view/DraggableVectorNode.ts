// Copyright 2023, University of Colorado Boulder

/**
 * Used to show the draggable velocity vectors.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Aaron Davis (PhET Interactive Simulations)
 */


import { Shape } from '../../../kite/js/imports.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { Color, DragListener, Path, PressListenerEvent, Text } from '../../../scenery/js/imports.js';
import VectorNode, { VectorNodeOptions } from './VectorNode.js';
import Body from '../model/Body.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import optionize from '../../../phet-core/js/optionize.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import solarSystemCommon from '../solarSystemCommon.js';

type SelfOptions = {
  zeroAllowed?: boolean;
  maxMagnitudeProperty?: TReadOnlyProperty<number> | null;
};

export type DraggableVectorNodeOptions = SelfOptions & VectorNodeOptions;

export default class DraggableVectorNode extends VectorNode {

  private readonly disposeDraggableVectorNode: () => void;

  public constructor(
    body: Body,
    transformProperty: TReadOnlyProperty<ModelViewTransform2>,
    visibleProperty: TReadOnlyProperty<boolean>,
    vectorProperty: TReadOnlyProperty<Vector2>,
    scale: number,
    labelText: TReadOnlyProperty<string>,
    providedOptions?: DraggableVectorNodeOptions ) {

    const options = optionize<DraggableVectorNodeOptions, SelfOptions, VectorNodeOptions>()( {
      zeroAllowed: true,
      maxMagnitudeProperty: null
    }, providedOptions );

    super(
      body,
      transformProperty,
      visibleProperty,
      vectorProperty,
      scale,
      options
      );

    // a circle with text (a character) in the center, to help indicate what it represents
    // ("v" for velocity in this sim)
    const circle = Shape.circle( 0, 0, 18 );
    const grabArea = new Path( circle, {
      lineWidth: 3,
      stroke: Color.lightGray,
      cursor: 'pointer',
      tagName: 'div',
      focusable: true,
      innerContent: 'Velocity Body ' + ( body.index + 1 ),
      ariaRole: 'application'
    } );

    const text = new Text( labelText, {
      font: new PhetFont( { size: 22, weight: 'bold' } ),
      fill: Color.gray,
      maxWidth: 25
    } );
    this.tipProperty.link( tip => {
      text.center = tip;
      grabArea.center = tip;
    } );

    this.addChild( grabArea );
    this.addChild( text );

    // The velocity vector is rooted on the object, so we manage all of its drags by deltas.
    let previousPoint: Vector2 | null = null;
    let previousValue: Vector2 | null = null;

    // Add the drag handler
    const dragListener = new DragListener( {
      //REVIEW: See if dragListener can be improved (with positionProperty)
      //REVIEW: NOTE that the transform for the DragListener needs to include the scale
      canStartPress: () => !body.userControlledVelocityProperty.value,
      start: ( event: PressListenerEvent ) => {
        previousPoint = transformProperty.value.viewToModelPosition( this.globalToParentPoint( event.pointer.point ) ).timesScalar( 1 / scale );
        previousValue = body.velocityProperty.get();
        body.userControlledVelocityProperty.value = true;
      },
      drag: ( event: PressListenerEvent ) => {

        const currentPoint = transformProperty.value.viewToModelPosition( this.globalToParentPoint( event.pointer.point ) ).timesScalar( 1 / scale );
        if ( previousPoint ) {
          const delta = currentPoint.minus( previousPoint );

          const proposedVelocity = previousValue!.plus( delta );
          const viewVector = transformProperty.value.modelToViewDelta( proposedVelocity.times( scale ) );
          if ( viewVector.magnitude < 10 ) {
            if ( options.zeroAllowed ) {
              proposedVelocity.setXY( 0, 0 );
              body.velocityProperty.value = proposedVelocity;
            }
          }
          else if ( options.maxMagnitudeProperty && proposedVelocity.magnitude > options.maxMagnitudeProperty.value ) {
            const maxMagnitude = options.maxMagnitudeProperty.value;
            const unit = proposedVelocity.normalized();
            body.velocityProperty.value = unit.times( maxMagnitude );
          }
          else {
            body.velocityProperty.value = proposedVelocity;
          }
        }
      },
      end: () => {
        body.userControlledVelocityProperty.value = false;
      }
    } );
    grabArea.addInputListener( dragListener );

    // move behind the geometry created by the superclass
    grabArea.moveToBack();
    text.moveToBack();

    // For PhET-iO, when the node does not support input, don't show the drag circle
    const onInputEnabled = ( inputEnabled: boolean ) => {
      grabArea.visible = inputEnabled;
      text.visible = inputEnabled;
    };
    this.inputEnabledProperty.link( onInputEnabled );

    this.disposeDraggableVectorNode = () => {
      this.inputEnabledProperty.unlink( onInputEnabled );
      dragListener.dispose();
    };
  }

  public override dispose(): void {
    this.disposeDraggableVectorNode();

    super.dispose();
  }
}

solarSystemCommon.register( 'DraggableVectorNode', DraggableVectorNode );