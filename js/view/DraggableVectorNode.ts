// Copyright 2023, University of Colorado Boulder

/**
 * Used to show the draggable velocity vectors.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Aaron Davis (PhET Interactive Simulations)
 */


import { Shape } from '../../../kite/js/imports.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { Color, DragListener, KeyboardDragListener, Path, Text } from '../../../scenery/js/imports.js';
import VectorNode, { VectorNodeOptions } from './VectorNode.js';
import Body from '../model/Body.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import optionize from '../../../phet-core/js/optionize.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import solarSystemCommon from '../solarSystemCommon.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import TProperty from '../../../axon/js/TProperty.js';

type SelfOptions = {
  snapToZero?: boolean; // When the user sets the vector's magnitude to less than minimumMagnitude, it snaps to zero
  minimumMagnitude?: number; // The minimum magnitude of the vector
  maxMagnitudeProperty?: TReadOnlyProperty<number> | null;
};

export type DraggableVectorNodeOptions = SelfOptions & VectorNodeOptions;

export default class DraggableVectorNode extends VectorNode {

  private readonly disposeDraggableVectorNode: () => void;

  public constructor(
    body: Body,
    transformProperty: TReadOnlyProperty<ModelViewTransform2>,
    visibleProperty: TReadOnlyProperty<boolean>,
    vectorProperty: TProperty<Vector2>,
    basePositionProperty: TReadOnlyProperty<Vector2>,
    scale: number,
    labelText: TReadOnlyProperty<string>,
    providedOptions?: DraggableVectorNodeOptions ) {

    const options = optionize<DraggableVectorNodeOptions, SelfOptions, VectorNodeOptions>()( {
      snapToZero: true,
      minimumMagnitude: 10,
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

    const circleRadius = 18;

    // a circle with text (a character) in the center, to help indicate what it represents
    // ("v" for velocity in this sim)
    const grabArea = new Path( Shape.circle( 0, 0, circleRadius ), {
      lineWidth: 3,
      stroke: Color.lightGray,
      cursor: 'pointer',
      tagName: 'div',
      focusable: true,
      innerContent: 'Velocity Body ' + ( body.index + 1 ),
      ariaRole: 'application',
      focusHighlight: Shape.circle( 0, 0, circleRadius * 1.2 ) // 20% dilation
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

    // This represents the model coordinates of where the 'V' circle appears
    const vectorPositionProperty = new Vector2Property( vectorProperty.value.plus( basePositionProperty.value ) );
    vectorPositionProperty.link( vectorPosition => {
      const newVelocity = vectorPosition.subtract( basePositionProperty.value );
      if ( newVelocity.magnitude < options.minimumMagnitude ) {
        if ( options.snapToZero ) {
          vectorProperty.value = new Vector2( 0, 0 );
        }
        else {
          vectorProperty.value = newVelocity.withMagnitude( options.minimumMagnitude );
        }
      }
      else if ( options.maxMagnitudeProperty && newVelocity.magnitude > options.maxMagnitudeProperty.value ) {
        vectorProperty.value = newVelocity.withMagnitude( options.maxMagnitudeProperty.value );
      }
      else {
        vectorProperty.value = newVelocity;
      }
    } );

    // Add the drag handler
    const start = () => {
      body.userControlledVelocityProperty.value = true;
    };
    const end = () => {
      body.userControlledVelocityProperty.value = false;
    };

    const dragListener = new DragListener( {
      transform: transformProperty,
      positionProperty: vectorPositionProperty,
      canStartPress: () => !body.userControlledVelocityProperty.value,
      start: start,
      end: end
    } );
    grabArea.addInputListener( dragListener );
    // move behind the geometry created by the superclass
    grabArea.moveToBack();
    text.moveToBack();

    const keyboardDragListener = new KeyboardDragListener( {
      positionProperty: vectorProperty,
      transform: transformProperty,
      dragDelta: 8,
      shiftDragDelta: 2.5,
      start: start,
      end: end
    } );
    this.addInputListener( keyboardDragListener );

    this.disposeEmitter.addListener( () => {
      dragListener.dispose();
      keyboardDragListener.dispose();
      vectorPositionProperty.dispose();
    } );


    // For PhET-iO, when the node does not support input, don't show the drag circle
    const onInputEnabled = ( inputEnabled: boolean ) => {
      grabArea.visible = inputEnabled;
      text.visible = inputEnabled;
    };
    this.inputEnabledProperty.link( onInputEnabled );

    this.disposeDraggableVectorNode = () => {
      text.dispose();

      this.inputEnabledProperty.unlink( onInputEnabled );
    };
  }

  public override dispose(): void {
    this.disposeDraggableVectorNode();

    super.dispose();
  }
}

solarSystemCommon.register( 'DraggableVectorNode', DraggableVectorNode );