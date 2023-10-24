// Copyright 2023, University of Colorado Boulder

/**
 * SolarSystemCommonMeasuringTape is the model for the measuring tape.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../axon/js/Property.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import solarSystemCommon from '../solarSystemCommon.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import { PhetioObjectOptions } from '../../../tandem/js/PhetioObject.js';
import optionize from '../../../phet-core/js/optionize.js';

type SelfOptions = {
  basePosition?: Vector2;
  tipPosition?: Vector2;
};

type SolarSystemCommonMeasuringTapeOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class SolarSystemCommonMeasuringTape {

  public readonly basePositionProperty: Property<Vector2>;
  public readonly tipPositionProperty: Property<Vector2>;

  public constructor( providedOptions: SolarSystemCommonMeasuringTapeOptions ) {

    const options = optionize<SolarSystemCommonMeasuringTapeOptions, SelfOptions>()( {
      basePosition: new Vector2( 0, 0 ),
      tipPosition: new Vector2( 0, 0 )
    }, providedOptions );

    this.basePositionProperty = new Vector2Property( options.basePosition, {
      units: 'AU',
      tandem: options.tandem.createTandem( 'basePositionProperty' )
    } );

    this.tipPositionProperty = new Vector2Property( options.tipPosition, {
      units: 'AU',
      tandem: options.tandem.createTandem( 'tipPositionProperty' )
    } );
  }

  public reset(): void {
    this.basePositionProperty.reset();
    this.tipPositionProperty.reset();
  }
}

solarSystemCommon.register( 'SolarSystemCommonMeasuringTape', SolarSystemCommonMeasuringTape );