// Copyright 2023, University of Colorado Boulder

/**
 * BodyInfo is a data structure that describes the configuration of an orbital body.
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Vector2, { Vector2StateObject } from '../../../dot/js/Vector2.js';
import Range, { RangeStateObject } from '../../../dot/js/Range.js';
import solarSystemCommon from '../solarSystemCommon.js';
import IOType from '../../../tandem/js/types/IOType.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import BooleanIO from '../../../tandem/js/types/BooleanIO.js';
import NullableIO from '../../../tandem/js/types/NullableIO.js';
import StringIO from '../../../tandem/js/types/StringIO.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';

type SelfOptions = {
  isActive: boolean;
  mass: number;
  massRange?: Range;
  position: Vector2;
  velocity: Vector2;
  tandemName?: string;
};

type BodyInfoOptions = SelfOptions;

// The serialized state of BodyInfo. For PhET-iO serialization, fields must have types that are JSON-compatible.
type BodyInfoStateObject = {
  isActive: boolean;
  mass: number;
  massRange: RangeStateObject;
  position: Vector2StateObject;
  velocity: Vector2StateObject;
  tandemName: string | null;
};

export default class BodyInfo {

  public readonly isActive: boolean;
  public readonly mass: number;
  public readonly massRange: Range;
  public readonly position: Vector2;
  public readonly velocity: Vector2;
  public readonly tandemName: string | null;

  public constructor( providedOptions: BodyInfoOptions ) {
    this.isActive = providedOptions.isActive;
    this.mass = providedOptions.mass;
    this.massRange = providedOptions.massRange || SolarSystemCommonConstants.DEFAULT_MASS_RANGE;
    this.position = providedOptions.position;
    this.velocity = providedOptions.velocity;
    this.velocity = providedOptions.velocity;
    this.tandemName = providedOptions.tandemName || null;
  }

  /**
   * BodyInfoIO implements 'Data type serialization', as described in the Serialization section of
   * https://github.com/phetsims/phet-io/blob/main/doc/phet-io-instrumentation-technical-guide.md#serialization
   * Data type serialization is appropriate because BodyInfoIO itself is not a PhetioObject. Its role is as
   * a data type for a Property - similar to number, string, or Vector2. See startingBodyInfoProperty in
   * SolarSystemCommonModel.
   */
  public static readonly BodyInfoIO = new IOType<BodyInfo, BodyInfoStateObject>( 'BodyInfoIO', {
    valueType: BodyInfo,
    stateSchema: {
      isActive: BooleanIO,
      mass: NumberIO,
      massRange: Range.RangeIO,
      position: Vector2.Vector2IO,
      velocity: Vector2.Vector2IO,
      tandemName: NullableIO( StringIO )
    },
    // toStateObject: The default works fine here.
    fromStateObject: stateObject => new BodyInfo( {
      isActive: stateObject.isActive,
      mass: stateObject.mass,
      massRange: Range.RangeIO.fromStateObject( stateObject.massRange ),
      position: Vector2.fromStateObject( stateObject.position ),
      velocity: Vector2.fromStateObject( stateObject.velocity ),
      tandemName: stateObject.tandemName || undefined
    } )
  } );
}

solarSystemCommon.register( 'BodyInfo', BodyInfo );