// Copyright 2023, University of Colorado Boulder

/**
 * Draws a vector for a Body, such as a force vector or velocity vector.
 *
 * @author Agustín Vallejo
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
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import Enumeration from '../../../phet-core/js/Enumeration.js';
import { RichText } from '../../../scenery/js/imports.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';

type SelfOptions = {
  constrainSize?: boolean;
};

// Determines if the vector exceeds the min or max values, used only if constrainSize is true
class OversizeType extends EnumerationValue {
  public static readonly NONE = new OversizeType();
  public static readonly BIGGER = new OversizeType();
  public static readonly SMALLER = new OversizeType();

  public static readonly enumeration = new Enumeration( OversizeType );
}

export type VectorNodeOptions = ArrowNodeOptions & SelfOptions;

export default class VectorNode extends ArrowNode {
  protected readonly tipProperty: TReadOnlyProperty<Vector2>;
  protected readonly tailProperty: TReadOnlyProperty<Vector2>;
  private oversizeType: OversizeType = OversizeType.NONE;

  public constructor(
    body: Body,
    transformProperty: TReadOnlyProperty<ModelViewTransform2>,
    visibleProperty: TReadOnlyProperty<boolean>,
    vectorProperty: TReadOnlyProperty<Vector2>,
    forceScaleProperty: TReadOnlyProperty<number>,
    providedOptions?: VectorNodeOptions
  ) {

    const options = optionize<VectorNodeOptions, SelfOptions, ArrowNodeOptions>()( {
      // Self options
      constrainSize: false,

      headHeight: 15,
      headWidth: 15,
      tailWidth: 5,
      stroke: '#404040',
      boundsMethod: 'none',
      isHeadDynamic: true,
      scaleTailToo: true,
      visibleProperty: visibleProperty
    }, providedOptions );

    super( 0, 0, 0, 0, options );

    this.tailProperty = new DerivedProperty( [ body.positionProperty, transformProperty ],
      ( bodyPosition, transform ) => {
        return transform.modelToViewPosition( bodyPosition );
      } );

    const oversizeText = new RichText( '', SolarSystemCommonConstants.TEXT_OPTIONS );
    this.addChild( oversizeText );

    this.tipProperty = new DerivedProperty( [ this.tailProperty, vectorProperty, transformProperty, forceScaleProperty ],
      ( tail, vector, transform, forceScale ) => {
        const finalPosition = transform.modelToViewDelta( vector.times( 0.05 * Math.pow( 10, forceScale ) ) ).plus( tail );
        oversizeText.center = finalPosition;
        return finalPosition;
      } );

    Multilink.multilink( [ this.tailProperty, this.tipProperty ], ( tail, tip ) => {
      this.setTailAndTip( tail.x, tail.y, tip.x, tip.y );
      this.localBounds = Bounds2.point( tail ).addPoint( tip ).dilated( 10 ); // must set because boundsMethod: 'none'.
    } );
  }

  public override dispose(): void {
    this.tailProperty.dispose();
    this.tipProperty.dispose();

    super.dispose();
  }
}

solarSystemCommon.register( 'VectorNode', VectorNode );