// Copyright 2023, University of Colorado Boulder

/**
 * SolarSystemCommonModel is the base class for the top-level model, used by all screens in my-solar-system and
 * keplers-laws.
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
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import SolarSystemCommonColors from '../SolarSystemCommonColors.js';
import Multilink from '../../../axon/js/Multilink.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';
import Emitter from '../../../axon/js/Emitter.js';
import optionize from '../../../phet-core/js/optionize.js';
import { PhetioObjectOptions } from '../../../tandem/js/PhetioObject.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import RangeWithValue from '../../../dot/js/RangeWithValue.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import Property from '../../../axon/js/Property.js';
import ArrayIO from '../../../tandem/js/types/ArrayIO.js';
import BodyInfo from './BodyInfo.js';
import SolarSystemCommonMeasuringTape from './SolarSystemCommonMeasuringTape.js';
import Vector2 from '../../../dot/js/Vector2.js';

// Constants
const BODY_COLORS = [
  SolarSystemCommonColors.body1ColorProperty,
  SolarSystemCommonColors.body2ColorProperty,
  SolarSystemCommonColors.body3ColorProperty,
  SolarSystemCommonColors.body4ColorProperty
];

// Type definitions
type SelfOptions<EngineType extends Engine> = {
  engineFactory: ( bodies: Body[] ) => EngineType;
  zoomLevelRange: RangeWithValue;
  defaultBodyInfo: BodyInfo[];
  timeScale?: number;
  modelToViewTime?: number;

  // phetioReadOnly value for numberOfActiveBodiesProperty
  numberOfActiveBodiesPropertyPhetioReadOnly?: boolean;
};

export type SolarSystemCommonModelOptions<EngineType extends Engine> = SelfOptions<EngineType> &
  PickRequired<PhetioObjectOptions, 'tandem'>;

export default abstract class SolarSystemCommonModel<EngineType extends Engine = Engine> {

  // Initial values that were used to instantiate Body instances
  protected readonly defaultBodyInfo: BodyInfo[];

  // The complete set of Body instances, active and inactive
  public readonly bodies: Body[];

  // The set of Body instances in this.bodies that are active (body.isActive === true)
  public readonly activeBodies: ObservableArray<Body>;

  // The number of Bodies that are 'active', and thus visible on the screen.
  public readonly numberOfActiveBodiesProperty: NumberProperty;

  // Bodies will be set to these values when restart is called. Updated when the user changes a Body.
  // This needs to be stateful so that we return to the desired configuration when resetting the time control.
  private startingBodyInfoProperty: Property<BodyInfo[]>;

  // The engine that will run all the physical calculations, including body interactions and collisions
  public readonly engine: EngineType;

  // Indicates whether the user has interacted with the bodies of the simulation (changing position, mass or velocity)
  public readonly userHasInteractedProperty: Property<boolean>;

  // Emitter that fires when the user interaction starts
  public readonly userInteractingEmitter = new Emitter();

  // Controls the velocity of time by scaling dt
  public readonly timeScale: number;

  // Transform between model's and view's times
  public readonly modelToViewTime: number;

  // Maps a TimeSpeed to a multiplier for dt
  public readonly timeSpeedMap = new Map<TimeSpeed, number>( [
    [ TimeSpeed.FAST, 7 / 4 ],
    [ TimeSpeed.NORMAL, 1 ],
    [ TimeSpeed.SLOW, 1 / 4 ]
  ] );

  public readonly timeProperty: NumberProperty;
  public readonly isPlayingProperty: BooleanProperty;
  public readonly timeSpeedProperty: EnumerationProperty<TimeSpeed>;

  // Boolean that determines if more path points are going to be stored for subsequent display in the paths.
  // This does not need to be stateful because it will be set correctly when pathVisibleProperty is set.
  public addingPathPoints = false;

  // Numerical level of zoom selected. It's not directly the zoom applied, but an integer to be used in the calculation.
  public readonly zoomLevelProperty: NumberProperty;

  // How much to scale the model-view transform when zooming in and out
  public abstract zoomScaleProperty: TReadOnlyProperty<number>;

  // Indicates whether any Body has gone off-screen or has collided an exploded.
  // This controls the visibility of the 'Return Bodies' button in the view.
  public readonly bodiesAreReturnableProperty: TReadOnlyProperty<boolean>;

  // Indicates whether any Body has collided with another Body.
  public readonly isAnyBodyCollidedProperty: Property<boolean>;

  // Power of 10 to which the gravity force is scaled
  public readonly gravityForceScalePowerProperty: NumberProperty;

  // Indicates whether any gravity force vector is currently off scale (too small to see).
  public readonly isAnyGravityForceOffscaleProperty: TReadOnlyProperty<boolean>;

  public readonly measuringTape: SolarSystemCommonMeasuringTape;

  protected constructor( providedOptions: SolarSystemCommonModelOptions<EngineType> ) {

    const options = optionize<SolarSystemCommonModelOptions<EngineType>, SelfOptions<EngineType>>()( {

      // SelfOptions
      timeScale: 0.05,
      modelToViewTime: 1000 * SolarSystemCommonConstants.TIME_MULTIPLIER,
      numberOfActiveBodiesPropertyPhetioReadOnly: true
    }, providedOptions );

    this.defaultBodyInfo = options.defaultBodyInfo;

    // The complete set of Body elements, grouped under a parent tandem, in ascending order of index.
    const bodiesTandem = options.tandem.createTandem( 'bodies' );
    this.bodies = this.defaultBodyInfo.map( ( bodyInfo, index ) =>
      new Body( index + 1, bodyInfo, BODY_COLORS[ index ],
        bodiesTandem.createTandem( bodyInfo.tandemName ? bodyInfo.tandemName : `body${index + 1}` ) )
    );

    this.startingBodyInfoProperty = new Property<BodyInfo[]>( [], {
      tandem: options.tandem.createTandem( 'startingBodyInfoProperty' ),
      phetioReadOnly: true,
      phetioValueType: ArrayIO( BodyInfo.BodyInfoIO ),
      phetioDocumentation: 'For internal use only'
    } );
    this.saveStartingBodyInfo();

    this.activeBodies = createObservableArray( {
      tandem: options.tandem.createTandem( 'activeBodies' ),
      phetioType: createObservableArray.ObservableArrayIO( Body.BodyIO ),
      phetioReadOnly: true,
      phetioDocumentation: 'The set of bodies that are currently active, and thus visible on the screen.'
    } );

    this.isAnyBodyCollidedProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'isAnyBodyCollidedProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'True if any of the bodies have collided.'
    } );

    // We want to synchronize bodies and activeBodies, so that activeBodies is effectively bodies.filter( isActive )
    // Order matters, AND we don't want to remove items unnecessarily, so some additional logic is required.
    Multilink.multilinkAny( this.bodies.map( body => body.isActiveProperty ), () => {
      const idealBodies = this.bodies.filter( body => body.isActiveProperty.value );

      // Remove all inactive bodies
      this.activeBodies.filter( body => !body.isActiveProperty.value ).forEach( body => {
        this.activeBodies.remove( body );
        body.reset();
      } );

      // Add in active bodies (in order)
      for ( let i = 0; i < idealBodies.length; i++ ) {
        if ( this.activeBodies[ i ] !== idealBodies[ i ] ) {
          this.activeBodies.splice( i, 0, idealBodies[ i ] );
        }
      }

      this.isAnyBodyCollidedProperty.reset();
    } );

    this.numberOfActiveBodiesProperty = new NumberProperty( this.activeBodies.length, {
      numberType: 'Integer',
      range: new Range( 1, this.bodies.length ),
      tandem: options.tandem.createTandem( 'numberOfActiveBodiesProperty' ),
      phetioReadOnly: options.numberOfActiveBodiesPropertyPhetioReadOnly,
      phetioFeatured: !options.numberOfActiveBodiesPropertyPhetioReadOnly // featured if it's not readonly
    } );

    this.gravityForceScalePowerProperty = new NumberProperty( 0, {
      range: new Range( -2, 8 ),
      tandem: options.tandem.createTandem( 'gravityForceScalePowerProperty' ),
      phetioReadOnly: true,
      phetioFeatured: true,
      phetioDocumentation: 'Power of 10 to which the gravity force is scaled'
    } );

    // True if any gravity force vector would be too small to see when drawn.
    this.isAnyGravityForceOffscaleProperty = DerivedProperty.deriveAny(
      [ ...this.bodies.map( body => body.gravityForceProperty ), this.gravityForceScalePowerProperty ],
      () => !!_.find( this.bodies, body => {
        const magnitudeLog = Math.log10( body.gravityForceProperty.value.magnitude );
        // 3.2 is the magnitude at which the vector starts being too small to see
        return ( magnitudeLog < 3.2 - this.gravityForceScalePowerProperty.value );
      } ) );

    this.userHasInteractedProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'userHasInteractedProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'For internal use only'
    } );

    this.bodiesAreReturnableProperty = DerivedProperty.or( [ ...this.bodies.map( body => body.isOffscreenProperty ), this.isAnyBodyCollidedProperty ] );

    this.bodies.forEach( body => {
      body.collidedEmitter.addListener( () => {
        this.isAnyBodyCollidedProperty.value = true;
      } );

      Multilink.lazyMultilink(
        [ body.userIsControllingPositionProperty, body.userIsControllingVelocityProperty, body.userIsControllingMassProperty ],
        ( userIsControllingPosition: boolean, userIsControllingVelocity: boolean, userIsControllingMass: boolean ) => {
          if ( userIsControllingPosition || userIsControllingVelocity ) {
            this.isPlayingProperty.value = false;
          }
          if ( !this.bodiesAreReturnableProperty.value ) {
            this.saveStartingBodyInfo();
          }
          this.userInteractingEmitter.emit();
          this.userHasInteractedProperty.value = true;
        } );
    } );

    this.engine = options.engineFactory( this.activeBodies );
    this.engine.reset();

    // Time settings
    this.timeScale = options.timeScale;
    this.modelToViewTime = options.modelToViewTime;

    // Time Properties, grouped under a parent tandem
    const timeTandem = options.tandem.createTandem( 'time' );
    this.timeProperty = new NumberProperty( 0, {
      units: 'years',
      tandem: timeTandem.createTandem( 'timeProperty' ),
      phetioReadOnly: true
    } );

    this.timeSpeedProperty = new EnumerationProperty( TimeSpeed.NORMAL, {
      tandem: timeTandem.createTandem( 'timeSpeedProperty' ),
      phetioDocumentation: 'Controls how fast the simulation\'s internal clock runs'
    } );

    this.isPlayingProperty = new BooleanProperty( false, {
      tandem: timeTandem.createTandem( 'isPlayingProperty' ),
      phetioDocumentation: 'True when the clock is running'
    } );

    this.zoomLevelProperty = new NumberProperty( options.zoomLevelRange.defaultValue, {
      range: options.zoomLevelRange,
      numberType: 'Integer',
      tandem: options.tandem.createTandem( 'zoomLevelProperty' ),
      phetioDocumentation: 'Integer index that is used to compute how the view is scaled. Larger values are more zoomed in.'
    } );

    this.measuringTape = new SolarSystemCommonMeasuringTape( {
      basePosition: new Vector2( 0, 1 ),
      tipPosition: new Vector2( 1, 1 ),
      tandem: options.tandem.createTandem( 'measuringTape' )
    } );
  }

  public saveStartingBodyInfo(): void {
    this.startingBodyInfoProperty.value = this.bodies.map( body => body.getBodyInfo() );
  }

  /**
   * Sets Body instances to have the specified values.
   */
  public loadBodyInfo( bodiesInfo: BodyInfo[] ): void {
    for ( let i = 0; i < this.bodies.length; i++ ) {
      const bodyInfo = bodiesInfo[ i ];

      if ( bodyInfo ) {
        this.bodies[ i ].isActiveProperty.value = bodyInfo.isActive;

        // Setting initial values and then resetting the body to make sure the body is in the correct state
        this.bodies[ i ].massProperty.setInitialValue( bodyInfo.mass );
        this.bodies[ i ].positionProperty.setInitialValue( bodyInfo.position.copy() ); // copy because positionProperty value may be mutated directly
        this.bodies[ i ].velocityProperty.setInitialValue( bodyInfo.velocity.copy() ); // copy because velocityProperty value may be mutated directly
        this.bodies[ i ].reset();
      }
      else {
        this.bodies[ i ].isActiveProperty.value = false;
      }
    }

    this.saveStartingBodyInfo();
  }

  /**
   * Adds the next available body to the system and checks that is doesn't collide with any other bodies.
   */
  public addNextBody(): void {
    const newBody = this.bodies.find( body => !body.isActiveProperty.value );
    if ( newBody ) {
      newBody.reset();
      newBody.preventCollision( this.activeBodies );
      newBody.isActiveProperty.value = true;
    }
    this.saveStartingBodyInfo();
    this.isAnyBodyCollidedProperty.reset();
  }

  public removeLastBody(): void {
    const lastBody = this.activeBodies[ this.activeBodies.length - 1 ];
    lastBody.isActiveProperty.value = false;
    this.saveStartingBodyInfo();
    this.isAnyBodyCollidedProperty.reset();
  }

  public reset(): void {
    this.isPlayingProperty.value = false; // Pause the sim
    this.timeSpeedProperty.reset();
    this.zoomLevelProperty.reset();
    this.gravityForceScalePowerProperty.reset();
    this.measuringTape.reset();

    this.startingBodyInfoProperty.value = this.defaultBodyInfo;
    this.restart();

    this.userHasInteractedProperty.reset();
  }

  // Restart is for when the time controls are brought back to 0
  // Bodies move to their last modified position
  public restart(): void {
    this.isAnyBodyCollidedProperty.reset();
    this.isPlayingProperty.value = false; // Pause the sim
    this.timeProperty.reset(); // Reset the time
    this.loadBodyInfo( this.startingBodyInfoProperty.value ); // Reset the bodies
    this.update();
  }

  /**
   * Updating for when the bodies are changed
   */
  public update(): void {
    this.engine.update( this.activeBodies );
    this.numberOfActiveBodiesProperty.value = this.activeBodies.length;
  }

  // The child class should implement this method to advance time and update the bodies properties
  public abstract stepOnce( dt: number ): void;

  public step( dt: number ): void {
    this.update();

    if ( this.isPlayingProperty.value ) {
      this.stepOnce( dt );
    }
  }

  public clearPaths(): void {
    this.activeBodies.forEach( body => {
      body.clearPath();
    } );
  }
}

solarSystemCommon.register( 'SolarSystemCommonModel', SolarSystemCommonModel );