// Copyright 2023, University of Colorado Boulder

/**
 * CueingArrowsNode is the cueing arrows used to indicate that something can be dragged in some direction.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { NodeTranslationOptions, Path, PathOptions } from '../../../scenery/js/imports.js';
import ArrowShape from '../../../scenery-phet/js/ArrowShape.js';
import { Shape } from '../../../kite/js/imports.js';
import optionize from '../../../phet-core/js/optionize.js';
import PickOptional from '../../../phet-core/js/types/PickOptional.js';
import solarSystemCommon from '../solarSystemCommon.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';

type SelfOptions = {
  length?: number;
  bodyRadius?: number;
};

type CueingArrowsNodeOptions = SelfOptions &
  PickOptional<PathOptions, 'fill' | 'stroke' | 'scale' | 'visibleProperty'> &
  NodeTranslationOptions;

export default class CueingArrowsNode extends Path {

  // length of the arrows, from tip to tip
  private readonly length: number;

  private readonly disposeCueingArrowsNode: () => void;

  public constructor( providedOptions?: CueingArrowsNodeOptions ) {

    const options = optionize<CueingArrowsNodeOptions, SelfOptions, PathOptions>()( {

      // CueingArrowsNodeOptions
      bodyRadius: 10,
      length: 15,

      // PathOptions
      fill: 'rgb( 0, 200, 0 )',
      stroke: 'black'

    }, providedOptions );

    super( createArrowsShape( options.bodyRadius, options.length ), options );

    this.length = options.length;

    const updateTouchArea = () => {
      this.touchArea = this.localBounds.dilated( 5 );
      this.mouseArea = this.localBounds.dilated( 3 );
    };
    this.boundsProperty.link( updateTouchArea );

    this.disposeCueingArrowsNode = () => {
      this.boundsProperty.unlink( updateTouchArea );
    };
  }

  public override dispose(): void {
    super.dispose();
    this.disposeCueingArrowsNode();
  }

  public static createVisibleProperty( inputEnabledProperty: TReadOnlyProperty<boolean>,
                                       wasDraggedProperty: TReadOnlyProperty<boolean> ): TReadOnlyProperty<boolean> {
    return new DerivedProperty(
      [ inputEnabledProperty, wasDraggedProperty ],
      ( inputEnabled, wasDragged ) =>
        ( inputEnabled && !wasDragged ) );
  }
}

const ARROW_SHAPE_OPTIONS = {
  doubleHead: false,
  headWidth: 12,
  headHeight: 8,
  tailWidth: 3
};

function createArrowsShape( radius: number, length: number ): Shape {
  radius += 5;
  const leftArrowShape = new ArrowShape( -radius, 0, -radius - length, 0, ARROW_SHAPE_OPTIONS );
  const downArrowShape = new ArrowShape( 0, -radius, 0, -radius - length, ARROW_SHAPE_OPTIONS );
  const upArrowShape = new ArrowShape( 0, radius, 0, radius + length, ARROW_SHAPE_OPTIONS );
  const rightArrowShape = new ArrowShape( radius, 0, radius + length, 0, ARROW_SHAPE_OPTIONS );
  const shape = Shape.union( [ leftArrowShape, downArrowShape, upArrowShape, rightArrowShape ] );
  return shape;
}

solarSystemCommon.register( 'CueingArrowsNode', CueingArrowsNode );