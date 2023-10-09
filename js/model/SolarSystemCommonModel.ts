// Copyright 2023, University of Colorado Boulder

/**
 * Main model for My Solar System.
 * In charge of keeping track of the position and states of the bodies,
 * their center of mass, and the time.
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import solarSystemCommon from '../solarSystemCommon.js';
import Body from './Body.js';
import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
import TimeSpeed from '../../../scenery-phet/js/TimeSpeed.js';
import createObservableArray, { ObservableArray } from '../../../axon/js/createObservableArray.js';
import Engine from './Engine.js';
import Range from '../../../dot/js/Range.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import ReadOnlyProperty from '../../../axon/js/ReadOnlyProperty.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import SolarSystemCommonColors from '../SolarSystemCommonColors.js';
import Multilink from '../../../axon/js/Multilink.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';
import Emitter from '../../../axon/js/Emitter.js';
import optionize from '../../../phet-core/js/optionize.js';
import TinyEmitter from '../../../axon/js/TinyEmitter.js';
import { PhetioObjectOptions } from '../../../tandem/js/PhetioObject.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import RangeWithValue from '../../../dot/js/RangeWithValue.js';

export type BodyInfo = {
  mass: number;
  position: Vector2;
  velocity: Vector2;
  active: boolean;
};

type SelfOptions<EngineType extends Engine> = {
  engineFactory: ( bodies: ObservableArray<Body> ) => EngineType;
  zoomLevelRange: RangeWithValue;
  timeScale?: number;
  modelToViewTime?: number;
  defaultBodyState?: BodyInfo[] | null;
};

export type SolarSystemCommonModelOptions<EngineType extends Engine> = SelfOptions<EngineType> &
  PickRequired<PhetioObjectOptions, 'tandem'>;

export default abstract class SolarSystemCommonModel<EngineType extends Engine = Engine> {

  // Bodies will consist of all bodies from availableBodies that have isActiveProperty.value === true, and will be in
  // order.
  public readonly bodies: ObservableArray<Body> = createObservableArray();
  public readonly availableBodies: Body[];

  //TODO https://github.com/phetsims/my-solar-system/issues/213 document
  public readonly userControlledProperty = new BooleanProperty( false );

  public readonly numberOfActiveBodiesProperty: NumberProperty;
  public readonly engine: EngineType;

  //TODO https://github.com/phetsims/my-solar-system/issues/213 document
  public readonly userInteractingEmitter = new Emitter();

  // Time control parameters
  public readonly timeScale: number; // Scale of the model's dt
  public readonly modelToViewTime: number; // Transform between model's and view's times
  public readonly timeFormatter = new Map<TimeSpeed, number>( [
    [ TimeSpeed.FAST, 7 / 4 ],
    [ TimeSpeed.NORMAL, 1 ],
    [ TimeSpeed.SLOW, 1 / 4 ]
  ] );
  public readonly timeProperty: NumberProperty;
  public readonly isPlayingProperty: BooleanProperty;
  public readonly timeSpeedProperty: EnumerationProperty<TimeSpeed>;
  public readonly hasPlayedProperty = new BooleanProperty( false );

  // Indicates if the path is visible. Lives in the model because it's also linked to model properties.
  public readonly pathVisibleProperty: BooleanProperty;

  //TODO https://github.com/phetsims/my-solar-system/issues/213 document
  public readonly moreDataProperty: BooleanProperty;

  //TODO https://github.com/phetsims/my-solar-system/issues/213 document
  public readonly realUnitsProperty: BooleanProperty;

  //TODO https://github.com/phetsims/my-solar-system/issues/213 document
  public readonly zoomLevelProperty: NumberProperty;

  //TODO https://github.com/phetsims/my-solar-system/issues/213 document, is this a scale?
  //TODO https://github.com/phetsims/keplers-laws/issues/191  zoomProperty should be readonly
  public zoomProperty: ReadOnlyProperty<number>;

  public readonly bodyAddedEmitter: TinyEmitter = new TinyEmitter();
  public readonly bodyRemovedEmitter: TinyEmitter = new TinyEmitter();

  // Indicates if any body is far from the play area
  public readonly isAnyBodyEscapedProperty: ReadOnlyProperty<boolean>;

  //TODO https://github.com/phetsims/my-solar-system/issues/213 document
  public readonly isAnyBodyCollidedProperty = new BooleanProperty( false );

  // Power of 10 to which the force is scaled
  public readonly forceScaleProperty: NumberProperty;

  // Indicates if any force arrow is currently off scale
  public readonly isAnyForceOffscaleProperty: ReadOnlyProperty<boolean>;

  // Define the mode bodies will go to when restarted. Is updated when the user changes a body.
  private startingBodyState: BodyInfo[] = [
    { active: true, mass: 250, position: new Vector2( 0, 0 ), velocity: new Vector2( 0, -11.1 ) },
    { active: true, mass: 25, position: new Vector2( 200, 0 ), velocity: new Vector2( 0, 111 ) }
  ];

  protected readonly defaultBodyState: BodyInfo[];

  protected constructor( providedOptions: SolarSystemCommonModelOptions<EngineType> ) {

    const options = optionize<SolarSystemCommonModelOptions<EngineType>, SelfOptions<EngineType>>()( {
      timeScale: 1,
      modelToViewTime: SolarSystemCommonConstants.TIME_MULTIPLIER,
      defaultBodyState: null
    }, providedOptions );

    // The complete set of Body elements, grouped under a parent tandem, in ascending order of index.
    const bodiesTandem = options.tandem.createTandem( 'bodies' );
    let bodyIndex = 1;
    this.availableBodies = [
      new Body( bodyIndex, 250, new Vector2( 0, 0 ), new Vector2( 0, -11.1 ), this.userControlledProperty, SolarSystemCommonColors.body1ColorProperty,
        bodiesTandem.createTandem( `body${bodyIndex++}` ) ),
      new Body( bodyIndex, 25, new Vector2( 200, 0 ), new Vector2( 0, 111 ), this.userControlledProperty, SolarSystemCommonColors.body2ColorProperty,
        bodiesTandem.createTandem( `body${bodyIndex++}` ) ),
      new Body( bodyIndex, 0.1, new Vector2( 100, 0 ), new Vector2( 0, 150 ), this.userControlledProperty, SolarSystemCommonColors.body3ColorProperty,
        bodiesTandem.createTandem( `body${bodyIndex++}` ) ),
      new Body( bodyIndex, 0.1, new Vector2( -100, -100 ), new Vector2( 120, 0 ), this.userControlledProperty, SolarSystemCommonColors.body4ColorProperty,
        bodiesTandem.createTandem( `body${bodyIndex++}` ) )
    ];

    // Activate the first two bodies by default
    this.availableBodies[ 0 ].isActiveProperty.value = true;
    this.availableBodies[ 1 ].isActiveProperty.value = true;

    // Define the default mode the bodies will show up in
    this.defaultBodyState = options.defaultBodyState ? options.defaultBodyState : this.availableBodies.map( body => body.info );

    // We want to synchronize availableBodies and bodies, so that bodies is effectively availableBodies.filter( isActive )
    // Order matters, AND we don't want to remove items unnecessarily, so some additional logic is required.
    Multilink.multilinkAny( this.availableBodies.map( body => body.isActiveProperty ), () => {
      const idealBodies = this.availableBodies.filter( body => body.isActiveProperty.value );

      // Remove all inactive bodies
      this.bodies.filter( body => !body.isActiveProperty.value ).forEach( body => {
        this.bodies.remove( body );
        body.reset();
      } );

      // Add in active bodies (in order)
      for ( let i = 0; i < idealBodies.length; i++ ) {
        if ( this.bodies[ i ] !== idealBodies[ i ] ) {
          this.bodies.splice( i, 0, idealBodies[ i ] );
        }
      }
    } );

    this.isAnyBodyEscapedProperty = DerivedProperty.or( [ ...this.availableBodies.map( body => body.escapedProperty ), this.isAnyBodyCollidedProperty ] );

    this.isAnyForceOffscaleProperty = DerivedProperty.or( this.availableBodies.map( body => body.forceOffscaleProperty ) );

    this.availableBodies.forEach( body => {
      body.collidedEmitter.addListener( () => {
        this.isAnyBodyCollidedProperty.value = true;
      } );

      Multilink.lazyMultilink(
        [ body.userControlledPositionProperty, body.userControlledVelocityProperty, body.userControlledMassProperty ],
        ( userControlledPosition: boolean, userControlledVelocity: boolean, userControlledMass: boolean ) => {
          if ( userControlledPosition || userControlledVelocity ) {
            this.isPlayingProperty.value = false;
          }
          if ( !this.isAnyBodyEscapedProperty.value ) {
            this.saveStartingBodyState();
          }
          this.userInteractingEmitter.emit();
          this.userControlledProperty.value = true;
        }
      );
    } );

    this.loadBodyStates( this.startingBodyState );
    this.numberOfActiveBodiesProperty = new NumberProperty( this.bodies.length );
    this.engine = options.engineFactory( this.bodies );
    this.engine.reset();

    // Time settings
    // timeScale controls the velocity of time
    this.timeScale = options.timeScale;
    this.modelToViewTime = options.modelToViewTime;
    this.timeProperty = new NumberProperty( 0 );
    this.isPlayingProperty = new BooleanProperty( false );
    this.timeSpeedProperty = new EnumerationProperty( TimeSpeed.NORMAL );

    this.moreDataProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'moreDataProperty' )
    } );
    this.realUnitsProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'realUnitsProperty' )
    } );

    this.forceScaleProperty = new NumberProperty( 0, {
      range: new Range( -2, 8 )
    } );

    this.zoomLevelProperty = new NumberProperty( options.zoomLevelRange.defaultValue, {
      range: options.zoomLevelRange,
      numberType: 'Integer',
      tandem: options.tandem.createTandem( 'zoomLevelProperty' )
    } );

    this.zoomProperty = new DerivedProperty( [ this.zoomLevelProperty ], zoomLevel => {
      return Utils.linear( 1, 6, 0.25, 1.25, zoomLevel );
    } );

    this.pathVisibleProperty = new BooleanProperty( true, {
      tandem: providedOptions.tandem.createTandem( 'pathVisibleProperty' )
    } );

    this.pathVisibleProperty.link( visible => {
      this.clearPaths();
    } );
  }

  public saveStartingBodyState(): void {
    this.startingBodyState = this.availableBodies.map( body => body.info );
  }

  /**
   * Sets the available bodies initial states according to bodiesInfo
   */
  public loadBodyStates( bodiesInfo: BodyInfo[], preventCollision = false ): void {
    for ( let i = 0; i < SolarSystemCommonConstants.NUM_BODIES; i++ ) {
      const bodyInfo = bodiesInfo[ i ];

      if ( bodyInfo ) {
        this.availableBodies[ i ].isActiveProperty.value = bodyInfo.active;

        // Setting initial values and then resetting the body to make sure the body is in the correct state
        this.availableBodies[ i ].massProperty.setInitialValue( bodyInfo.mass );
        this.availableBodies[ i ].positionProperty.setInitialValue( bodyInfo.position );
        this.availableBodies[ i ].velocityProperty.setInitialValue( bodyInfo.velocity );
        this.availableBodies[ i ].reset();
        if ( preventCollision ) {
          this.availableBodies[ i ].preventCollision( this.bodies );
        }
      }
      else {
        this.availableBodies[ i ].isActiveProperty.value = false;
      }
    }

    this.saveStartingBodyState();
  }

  /**
   * Adds the next available body to the system and checks that is doesn't collide with any other bodies.
   */
  public addNextBody(): void {
    const newBody = this.availableBodies.find( body => !body.isActiveProperty.value );
    if ( newBody ) {
      newBody.reset();
      newBody.preventCollision( this.bodies );
      newBody.isActiveProperty.value = true;
    }
    this.saveStartingBodyState();

    this.bodyAddedEmitter.emit();
    this.isAnyBodyCollidedProperty.reset();
  }

  public removeLastBody(): void {
    const numberOfActiveBodies = this.bodies.length - 1;
    const lastBody = this.bodies[ numberOfActiveBodies ];
    lastBody.isActiveProperty.value = false;
    this.saveStartingBodyState();

    this.bodyRemovedEmitter.emit();
    this.isAnyBodyCollidedProperty.reset();
  }

  public reset(): void {
    this.isPlayingProperty.value = false; // Pause the sim
    this.timeSpeedProperty.reset();
    this.zoomLevelProperty.reset();
    this.moreDataProperty.reset();
    this.pathVisibleProperty.reset();
    this.realUnitsProperty.reset();
    this.userControlledProperty.reset();
    this.forceScaleProperty.reset();

    this.startingBodyState = this.defaultBodyState;

    this.restart();
  }

  // Restart is for when the time controls are brought back to 0
  // Bodies move to their last modified position
  public restart(): void {
    this.isAnyBodyCollidedProperty.reset();
    this.hasPlayedProperty.value = false;
    this.isPlayingProperty.value = false; // Pause the sim
    this.timeProperty.reset(); // Reset the time
    this.loadBodyStates( this.startingBodyState ); // Reset the bodies
    this.update();
  }

  /**
   * Updating for when the bodies are changed
   */
  public update(): void {
    this.engine.update( this.bodies );
    this.numberOfActiveBodiesProperty.value = this.bodies.length;
  }

  public stepOnce( dt: number ): void {
    this.hasPlayedProperty.value = true;
    let adjustedDT = dt * this.timeFormatter.get( this.timeSpeedProperty.value )! * this.timeScale;

    // Limit the number of steps to 50 per frame
    const count = Math.ceil( adjustedDT / 0.02 );
    adjustedDT /= count;

    for ( let i = 0; i < count; i++ ) {
      // Only modify the properties on the last step
      const updateProperties = i === count - 1;
      this.engine.run( adjustedDT, updateProperties );
      this.engine.checkCollisions();
      this.timeProperty.value += adjustedDT * this.modelToViewTime;
      if ( this.pathVisibleProperty.value ) {
        this.bodies.forEach( body => body.addPathPoint() );
      }
    }
  }

  public step( dt: number ): void {
    this.update();

    if ( this.isPlayingProperty.value ) {
      this.stepOnce( dt );
    }
  }

  public clearPaths(): void {
    this.bodies.forEach( body => {
      body.clearPath();
    } );
  }
}

solarSystemCommon.register( 'SolarSystemCommonModel', SolarSystemCommonModel );