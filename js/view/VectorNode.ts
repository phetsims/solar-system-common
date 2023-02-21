// Copyright 2023, University of Colorado Boulder

/**
 * Draws a vector for a Body, such as a force vector or velocity vector.
 *
 * @author Agustín Vallejo
 */

import Body from '../model/Body.js';
import Vector2 from '../../../dot/js/Vector2.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import ArrowNode, { ArrowNodeOptions } from '../../../scenery-phet/js/ArrowNode.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Multilink from '../../../axon/js/Multilink.js';
import solarSystemCommon from '../solarSystemCommon.js';

export type VectorNodeOptions = ArrowNodeOptions;

export default class VectorNode extends ArrowNode {
  protected readonly tipProperty: TReadOnlyProperty<Vector2>;
  protected readonly tailProperty: TReadOnlyProperty<Vector2>;

  public constructor(
    body: Body,
    transformProperty: TReadOnlyProperty<ModelViewTransform2>,
    visibleProperty: TReadOnlyProperty<boolean>,
    vectorProperty: TReadOnlyProperty<Vector2>,
    scale: number,
    providedOptions?: VectorNodeOptions
  ) {

    super( 0, 0, 0, 0, optionize<VectorNodeOptions, EmptySelfOptions, ArrowNodeOptions>()( {
      headHeight: 15,
      headWidth: 15,
      tailWidth: 5,
      stroke: '#404040',
      boundsMethod: 'none',
      isHeadDynamic: true,
      scaleTailToo: true,
      visibleProperty: visibleProperty
    }, providedOptions ) );

    this.tailProperty = new DerivedProperty( [ body.positionProperty, transformProperty ],
      ( bodyPosition, transform ) => {
        return transform.modelToViewPosition( bodyPosition );
      } );

    this.tipProperty = new DerivedProperty( [ this.tailProperty, vectorProperty, transformProperty ],
      ( tail, vector, transform ) => {
        return transform.modelToViewDelta( vector.times( scale ) ).plus( tail );
      } );

    Multilink.multilink( [ this.tailProperty, this.tipProperty ], ( tail, tip ) => {
      this.setTailAndTip( tail.x, tail.y, tip.x, tip.y );
    } );
  }

  public override dispose(): void {
    this.tailProperty.dispose();
    this.tipProperty.dispose();

    super.dispose();
  }
}

solarSystemCommon.register( 'VectorNode', VectorNode );