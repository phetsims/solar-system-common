// Copyright 2023, University of Colorado Boulder

/**
 * Draws a vector for a Body, such as a force vector or velocity vector.
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import Body from '../model/Body.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import ArrowNode, { ArrowNodeOptions } from '../../../scenery-phet/js/ArrowNode.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import optionize from '../../../phet-core/js/optionize.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Multilink from '../../../axon/js/Multilink.js';
import solarSystemCommon from '../solarSystemCommon.js';

type SelfOptions = {
  //
  baseMagnitude?: number;
};

export type VectorNodeOptions = SelfOptions & ArrowNodeOptions;

export default class VectorNode extends ArrowNode {

  protected readonly tipProperty: TReadOnlyProperty<Vector2>;
  protected readonly tailProperty: TReadOnlyProperty<Vector2>;

  public constructor(
    body: Body,
    transformProperty: TReadOnlyProperty<ModelViewTransform2>,
    vectorProperty: TReadOnlyProperty<Vector2>,
    forceScaleProperty: TReadOnlyProperty<number>,
    providedOptions?: VectorNodeOptions
  ) {

    const options = optionize<VectorNodeOptions, SelfOptions, ArrowNodeOptions>()( {

      // SelfOptions
      baseMagnitude: 500,

      // ArrowNodeOptions
      isDisposable: false, // see https://github.com/phetsims/my-solar-system/issues/230
      headHeight: 15,
      headWidth: 15,
      tailWidth: 5,
      stroke: '#404040',
      boundsMethod: 'none',
      isHeadDynamic: true,
      scaleTailToo: true
    }, providedOptions );

    super( 0, 0, 0, 0, options );

    this.tailProperty = new DerivedProperty( [ body.positionProperty, transformProperty ],
      ( bodyPosition, transform ) => {
        return transform.modelToViewPosition( bodyPosition );
      } );

    this.tipProperty = new DerivedProperty( [ this.tailProperty, vectorProperty, transformProperty, forceScaleProperty ],
      ( tail, vector, transform, forceScale ) => {
        // forceScale currently goes from -2 to 8, where -2 is scaling down for big vectors ~100 units of force
        // and 8 is scaling up for small vectors ~1/100000000 units of force
        const magnitudeLog = vector.magnitude ? Math.log10( vector.magnitude / options.baseMagnitude ) : -forceScale;
        if ( magnitudeLog > -forceScale + 1.5 ) {
          // body.forceOffscaleProperty.value = true;
        }
        else if ( magnitudeLog < -forceScale - 0.4 ) {
          body.forceOffscaleProperty.value = true;
        }
        else {
          body.forceOffscaleProperty.value = false;
        }
        const finalTip = vector.times( 0.05 * Math.pow( 10, forceScale ) );
        if ( finalTip.magnitude > 1e4 ) {
          finalTip.setMagnitude( 1e4 );
          body.forceOffscaleProperty.value = false;
        }
        const finalPosition = transform.modelToViewDelta( finalTip ).plus( tail );
        return finalPosition;
      } );

    Multilink.multilink( [ this.tailProperty, this.tipProperty ], ( tail, tip ) => {
      this.setTailAndTip( tail.x, tail.y, tip.x, tip.y );
      this.localBounds = Bounds2.point( tail ).addPoint( tip ).dilated( 10 ); // must set because boundsMethod: 'none'.
    } );

    this.addLinkedElement( body );
  }
}

solarSystemCommon.register( 'VectorNode', VectorNode );