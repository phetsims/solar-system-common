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
import BodyInfo from './BodyInfo.js';

const MAX_PATH_LENGTH = 2000;

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

  // Determines if the body is currently visible on screen and considered in calculations.
  public readonly isActiveProperty: Property<boolean>;

  // True when the body goes off-screen
  public readonly escapedProperty: Property<boolean>;

  // True when the body force is off-scale
  public readonly forceOffscaleProperty: Property<boolean>;

  // User modified Properties
  // Determines if the user has changes anything about the body
  public readonly userControlledProperty: Property<boolean>;

  // Determines if the user has changed the position, velocity, or mass of the body
  public readonly userControlledPositionProperty: Property<boolean>;
  public readonly userControlledVelocityProperty: Property<boolean>;
  public readonly userControlledMassProperty: Property<boolean>;

  // Array of points for drawing the path
  public readonly pathPoints: ObservableArray<Vector2>;

  // The color used for the Body in icons, paths, UI components, etc.
  public readonly colorProperty: TReadOnlyProperty<Color>;

  // Total sum of the distance of the drawn path. Not using the word 'length' to not confuse it with the points array length.
  // This is a Property because it needs to be stateful for PhET-iO.
  private readonly pathDistanceProperty: NumberProperty;

  public constructor( index: number, bodyInfo: BodyInfo, userControlledProperty: Property<boolean>,
                      colorProperty: ReadOnlyProperty<Color>, tandem: Tandem ) {
    assert && assert( Number.isInteger( index ) && index >= 1, `invalid index: ${index}` );

    super( {
      tandem: tandem,
      phetioType: Body.BodyIO,
      phetioState: false,
      isDisposable: false
    } );

    this.index = index;

    this.massProperty = new NumberProperty( bodyInfo.mass, {
      //TODO https://github.com/phetsims/my-solar-system/issues/208 units
      //TODO https://github.com/phetsims/my-solar-system/issues/208 range - use Range(0.000001,300), see MASS_RANGE in ValuesColumnNode and presets in LabModel
      isValidValue: mass => ( mass > 0 ),
      hasListenerOrderDependencies: true, // during reset listener order is key for calculating correct values.
      tandem: tandem.createTandem( 'massProperty' )
    } );

    this.radiusProperty = new DerivedProperty( [ this.massProperty ], mass => Body.massToRadius( mass ) );

    this.positionProperty = new Vector2Property( bodyInfo.position, {
      //TODO https://github.com/phetsims/my-solar-system/issues/244 units
      tandem: tandem.createTandem( 'positionProperty' ),
      phetioReadOnly: true
    } );

    this.velocityProperty = new Vector2Property( bodyInfo.velocity, {
      //TODO https://github.com/phetsims/my-solar-system/issues/244 units
      tandem: tandem.createTandem( 'velocityProperty' ),
      phetioReadOnly: true
    } );

    this.accelerationProperty = new Vector2Property( new Vector2( 0, 0 ), {
      //TODO https://github.com/phetsims/my-solar-system/issues/244 units
      tandem: tandem.createTandem( 'accelerationProperty' ),
      phetioReadOnly: true
    } );

    this.forceProperty = new Vector2Property( new Vector2( 0, 0 ), {
      //TODO https://github.com/phetsims/my-solar-system/issues/244 units
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
    this.pathPoints = createObservableArray( {
      tandem: tandem.createTandem( 'pathPoints' ),
      phetioType: createObservableArray.ObservableArrayIO( Vector2.Vector2IO ),
      phetioDocumentation: 'The set of points used to draw the body\'s path'
    } );

    this.pathDistanceProperty = new NumberProperty( 0, {
      //TODO https://github.com/phetsims/my-solar-system/issues/208 units?
      tandem: tandem.createTandem( 'pathDistanceProperty' ),
      phetioReadOnly: true
    } );
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
        this.pathDistanceProperty.value += pathPoint.distance( this.pathPoints[ this.pathPoints.length - 2 ] );
      }

      // Remove points from the path as the path gets too long
      while ( this.pathDistanceProperty.value > MAX_PATH_LENGTH ) {
        this.pathDistanceProperty.value -= this.pathPoints[ 1 ].distance( this.pathPoints[ 0 ] );
        this.pathPoints.shift();
      }

    }
  }

  public get info(): BodyInfo {
    return new BodyInfo( {
      mass: this.massProperty.value,
      position: this.positionProperty.value.copy(),
      velocity: this.velocityProperty.value.copy(),
      isActive: this.isActiveProperty.value
    } );
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
    this.pathDistanceProperty.reset();
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