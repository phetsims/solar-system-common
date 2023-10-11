// Copyright 2023, University of Colorado Boulder

/**
 * Model for a gravitational interacting Body
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import createObservableArray, { ObservableArray } from '../../../axon/js/createObservableArray.js';
import Vector2 from '../../../dot/js/Vector2.js';
import solarSystemCommon from '../solarSystemCommon.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import { Color } from '../../../scenery/js/imports.js';
import TinyEmitter from '../../../axon/js/TinyEmitter.js';
import Property from '../../../axon/js/Property.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Tandem from '../../../tandem/js/Tandem.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import ReadOnlyProperty from '../../../axon/js/ReadOnlyProperty.js';
import IOType from '../../../tandem/js/types/IOType.js';
import ReferenceIO, { ReferenceIOState } from '../../../tandem/js/types/ReferenceIO.js';

export type BodyInfo = {
  isActive: boolean;
  mass: number;
  position: Vector2;
  velocity: Vector2;
};

export type BodyStateObject = ReferenceIOState; // because BodyIO is a subtype of ReferenceIO

export default class Body extends PhetioObject {

  // Index of the body, 1-based to correspond to the UI and PhET-iO.
  public readonly index: number;

  // Unitless body quantities (physical properties)
  public readonly massProperty: Property<number>;
  public readonly radiusProperty: TReadOnlyProperty<number>;
  public readonly positionProperty: Property<Vector2>;
  public readonly velocityProperty: Property<Vector2>;
  public readonly accelerationProperty: Property<Vector2>;
  public readonly forceProperty: Property<Vector2>;

  // Collision handling
  public readonly collidedEmitter = new TinyEmitter();

  // Not resettable, common model will handle. Determines if the body is currently on-screen
  public readonly isActiveProperty: Property<boolean>;

  // True when the body goes off-screen
  public readonly escapedProperty: Property<boolean>;

  // True when the body force is off-scale
  public readonly forceOffscaleProperty: Property<boolean>;

  // User modified Properties
  //TODO https://github.com/phetsims/my-solar-system/issues/213 document these
  public readonly userControlledProperty: Property<boolean>;
  public readonly userControlledPositionProperty: Property<boolean>;
  public readonly userControlledVelocityProperty: Property<boolean>;
  public readonly userControlledMassProperty: Property<boolean>;

  // Array of points for drawing the path
  public readonly pathPoints: ObservableArray<Vector2>;

  public readonly colorProperty: TReadOnlyProperty<Color>;

  //TODO https://github.com/phetsims/my-solar-system/issues/213 document
  //TODO https://github.com/phetsims/my-solar-system/issues/226 Does this field need to be stateful?
  private pathDistance = 0;

  public constructor( index: number, bodyInfo: BodyInfo, userControlledProperty: Property<boolean>,
                      colorProperty: ReadOnlyProperty<Color>, tandem: Tandem ) {
    assert && assert( Number.isInteger( index ) && index >= 1, `invalid index: ${index}` );

    super( {
      tandem: tandem,
      phetioType: Body.BodyIO,
      phetioState: false
    } );

    this.index = index;

    this.massProperty = new NumberProperty( bodyInfo.mass, {
      isValidValue: v => v > 0,
      hasListenerOrderDependencies: true, // during reset listener order is key for calculating correct values.
      tandem: tandem.createTandem( 'massProperty' ),
      phetioReadOnly: true
    } );

    this.radiusProperty = new DerivedProperty( [ this.massProperty ], mass => Body.massToRadius( mass ) );

    this.positionProperty = new Vector2Property( bodyInfo.position, {
      tandem: tandem.createTandem( 'positionProperty' ),
      phetioReadOnly: true
    } );

    this.velocityProperty = new Vector2Property( bodyInfo.velocity, {
      tandem: tandem.createTandem( 'velocityProperty' ),
      phetioReadOnly: true
    } );

    this.accelerationProperty = new Vector2Property( new Vector2( 0, 0 ), {
      tandem: tandem.createTandem( 'accelerationProperty' ),
      phetioReadOnly: true
    } );

    this.forceProperty = new Vector2Property( new Vector2( 0, 0 ), {
      tandem: tandem.createTandem( 'forceProperty' ),
      phetioReadOnly: true
    } );

    this.isActiveProperty = new BooleanProperty( bodyInfo.isActive, {
      tandem: tandem.createTandem( 'isActiveProperty' ),
      phetioReadOnly: true
    } );

    this.escapedProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'escapedProperty' ),
      phetioReadOnly: true
    } );

    this.forceOffscaleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'forceOffscaleProperty' ),
      phetioReadOnly: true
    } );

    this.userControlledProperty = userControlledProperty;

    this.userControlledPositionProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'userControlledPositionProperty' ),
      phetioReadOnly: true
    } );

    this.userControlledVelocityProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'userControlledVelocityProperty' ),
      phetioReadOnly: true
    } );

    this.userControlledMassProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'userControlledMassProperty' ),
      phetioReadOnly: true
    } );

    this.colorProperty = colorProperty;
    this.addLinkedElement( colorProperty );

    // Data for rendering the path
    this.pathPoints = createObservableArray();
  }

  public reset(): void {
    this.massProperty.reset();
    this.positionProperty.reset();
    this.velocityProperty.reset();
    this.accelerationProperty.reset();
    this.forceProperty.reset();
    this.escapedProperty.reset();
    this.forceOffscaleProperty.reset();
    this.clearPath();
  }

  /**
   * Add a point to the collection of points that follow the trajectory of a moving body.
   * This also removes points when the path gets too long.
   */
  public addPathPoint(): void {
    const pathPoint = this.positionProperty.value.copy();

    // Only add or remove points if the body is effectively moving
    if ( this.pathPoints.length === 0 || !pathPoint.equals( this.pathPoints[ this.pathPoints.length - 1 ] ) ) {
      this.pathPoints.push( pathPoint );

      // Add the length to the tracked path length
      if ( this.pathPoints.length >= 2 ) {
        this.pathDistance += pathPoint.distance( this.pathPoints[ this.pathPoints.length - 2 ] );
      }

      // Remove points from the path as the path gets too long
      while ( this.pathDistance > 2000 ) {
        this.pathDistance -= this.pathPoints[ 1 ].distance( this.pathPoints[ 0 ] );
        this.pathPoints.shift();
      }

    }
  }

  public get info(): BodyInfo {
    return {
      mass: this.massProperty.value,
      position: this.positionProperty.value.copy(),
      velocity: this.velocityProperty.value.copy(),
      isActive: this.isActiveProperty.value
    };
  }

  public isOverlapping( otherBody: Body ): boolean {
    const distance = this.positionProperty.value.distance( otherBody.positionProperty.value );
    const radiusSum = this.radiusProperty.value + otherBody.radiusProperty.value;
    return distance < radiusSum;
  }

  public preventCollision( bodies: Body[] ): void {
    bodies.forEach( body => {
      if ( body !== this && this.isOverlapping( body ) ) {
        // If it's going to collide, arbitrarily move it 100 pixels up
        this.positionProperty.value = this.positionProperty.value.plus( new Vector2( 0, 100 ) );
        this.preventCollision( bodies );
      }
    } );
  }

  /**
   * Clear the whole path of points tracking the body's trajectory.
   */
  public clearPath(): void {
    this.pathPoints.clear();
    this.pathDistance = 0;
  }

  public static massToRadius( mass: number ): number {
    const minRadius = 3;
    return Math.max( minRadius, 2.3 * Math.pow( mass, 1 / 3 ) );
  }

  /**
   * BodyIO implements 'Reference type serialization', as described in the Serialization section of
   * https://github.com/phetsims/phet-io/blob/main/doc/phet-io-instrumentation-technical-guide.md#serialization
   * Reference type serialization is appropriate because all Body instances are created at startup, and exist
   * for the lifetime of the simulation.
   */
  public static readonly BodyIO = new IOType<Body, BodyStateObject>( 'BodyIO', {
    valueType: Body,
    supertype: ReferenceIO( IOType.ObjectIO )
  } );
}

solarSystemCommon.register( 'Body', Body );