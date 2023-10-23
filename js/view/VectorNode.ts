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
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';

type SelfOptions = {
  // Boolean to determine if the vector will be checked for offscaling or not
  checkForOffscaling?: boolean;

  // Normalization factor by which the vector will be scaled
  baseMagnitude?: number;

  // Power by which the scaling is offset. i.e. 2 means the vector will be originally scaled by 10^2
  scalingOffset?: number;
};

export type VectorNodeOptions = SelfOptions & ArrowNodeOptions;

export default class VectorNode extends ArrowNode {

  protected readonly tipPositionProperty: TReadOnlyProperty<Vector2>;
  protected readonly tailPositionProperty: TReadOnlyProperty<Vector2>;

  public constructor(
    body: Body,
    transformProperty: TReadOnlyProperty<ModelViewTransform2>,
    vectorProperty: TReadOnlyProperty<Vector2>,
    forceScalePowerProperty: TReadOnlyProperty<number>,
    providedOptions?: VectorNodeOptions
  ) {

    const options = optionize<VectorNodeOptions, SelfOptions, ArrowNodeOptions>()( {

      // SelfOptions
      checkForOffscaling: true,
      baseMagnitude: 1500,
      scalingOffset: 0,

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

    this.tailPositionProperty = new DerivedProperty( [ body.positionProperty, transformProperty ],
      ( bodyPosition, transform ) => {
        return transform.modelToViewPosition( bodyPosition );
      } );

    this.tipPositionProperty = new DerivedProperty( [ this.tailPositionProperty, vectorProperty, transformProperty, forceScalePowerProperty ],
      ( tail, vector, transform, forceScalePower ) => {
        if ( options.checkForOffscaling ) {
          // forceScalePower currently goes from -2 to 8, where -2 is scaling down for big vectors ~100 units of force
          // and 8 is scaling up for small vectors ~1/100000000 units of force
          const magnitudeLog = vector.magnitude ? Math.log10( vector.magnitude / options.baseMagnitude ) : -forceScalePower;
          body.gravityForceOffscaleProperty.value = false;
          if ( magnitudeLog < -forceScalePower - 0.4 ) {
            body.gravityForceOffscaleProperty.value = true;
          }
        }
        const finalTip = vector.times( Math.pow( 10, forceScalePower + options.scalingOffset ) );
        if ( finalTip.magnitude > 1e4 ) {
          finalTip.setMagnitude( 1e4 );
          body.gravityForceOffscaleProperty.value = false;
        }

        // Scaling the tip position for it to properly fit in the view
        finalTip.multiplyScalar( SolarSystemCommonConstants.VELOCITY_TO_VIEW_MULTIPLIER );
        const finalPosition = transform.modelToViewDelta( finalTip ).plus( tail );
        return finalPosition;
      } );

    Multilink.multilink( [ this.tailPositionProperty, this.tipPositionProperty ], ( tail, tip ) => {
      this.setTailAndTip( tail.x, tail.y, tip.x, tip.y );
      this.localBounds = Bounds2.point( tail ).addPoint( tip ).dilated( 10 ); // must set because boundsMethod: 'none'.
    } );

    this.addLinkedElement( body );
  }
}

solarSystemCommon.register( 'VectorNode', VectorNode );