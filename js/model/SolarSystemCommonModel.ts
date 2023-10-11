// Copyright 2023, University of Colorado Boulder

/**
 * SolarSystemCommonModel is the base class for the top-level model, used by all screens in my-solar-system and
 * keplers-laws.
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import solarSystemCommon from '../solarSystemCommon.js';
import Body, { BodyInfo } from './Body.js';
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
import TinyEmitter from '../../../axon/js/TinyEmitter.js';
import { PhetioObjectOptions } from '../../../tandem/js/PhetioObject.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import RangeWithValue from '../../../dot/js/RangeWithValue.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import Property from '../../../axon/js/Property.js';

// Constants
const BODY_COLORS = [
  SolarSystemCommonColors.body1ColorProperty,
  SolarSystemCommonColors.body2ColorProperty,
  SolarSystemCommonColors.body3ColorProperty,
  SolarSystemCommonColors.body4ColorProperty
];

// Type definitions
type SelfOptions<EngineType extends Engine> = {
  engineFactory: ( bodies: ObservableArray<Body> ) => EngineType;
  zoomLevelRange: RangeWithValue;
  defaultBodyInfo: BodyInfo[];
  timeScale?: number;
  modelToViewTime?: number;
};

export type SolarSystemCommonModelOptions<EngineType extends Engine> = SelfOptions<EngineType> &
  PickRequired<PhetioObjectOptions, 'tandem'>;

export default abstract class SolarSystemCommonModel<EngineType extends Engine = Engine> {

  // Initial values that were used to instantiate Body instances
  protected readonly defaultBodyInfo: BodyInfo[];

  // The complete set of Body instances, active and inactive
  public readonly availableBodies: Body[];

  // The set of Body instances in availableBodies that are active (body.isActive === true)
  public readonly bodies: ObservableArray<Body>;

  // The number of Bodies that are 'active', and thus visible on the screen. This is controlled by a NumberSpinner,
  // so may briefly have a value that is different from bodies.lengthProperty.
  public readonly numberOfActiveBodiesProperty: NumberProperty;

  // Bodies will be set to these values when restart is called. Updated when the user changes a Body.
  private startingBodyInfo: BodyInfo[] = [];

  //TODO https://github.com/phetsims/my-solar-system/issues/213 document
  public readonly engine: EngineType;

  //TODO https://github.com/phetsims/my-solar-system/issues/213 document
  public readonly userControlledProperty: Property<boolean>;

  //TODO https://github.com/phetsims/my-solar-system/issues/213 document
  public readonly userInteractingEmitter = new Emitter();

  // Controls the velocity of time by scaling dt
  public readonly timeScale: number;

  // Transform between model's and view's times
  public readonly modelToViewTime: number;

  //TODO https://github.com/phetsims/my-solar-system/issues/213 document
  public readonly timeFormatter = new Map<TimeSpeed, number>( [
    [ TimeSpeed.FAST, 7 / 4 ],
    [ TimeSpeed.NORMAL, 1 ],
    [ TimeSpeed.SLOW, 1 / 4 ]
  ] );

  public readonly timeProperty: NumberProperty;
  public readonly isPlayingProperty: BooleanProperty;
  public readonly timeSpeedProperty: EnumerationProperty<TimeSpeed>;

  //TODO https://github.com/phetsims/my-solar-system/issues/213 document
  public readonly hasPlayedProperty: Property<boolean>;

  //TODO https://github.com/phetsims/my-solar-system/issues/226 Does this field need to be stateful?
  public addingPathPoints = false;

  //TODO https://github.com/phetsims/my-solar-system/issues/213 document
  public readonly moreDataProperty: BooleanProperty;

  //TODO https://github.com/phetsims/my-solar-system/issues/213 document
  public readonly realUnitsProperty: BooleanProperty;

  //TODO https://github.com/phetsims/my-solar-system/issues/213 document
  public readonly zoomLevelProperty: NumberProperty;

  // How much to scale the model-view transform when zooming in and out
  public abstract zoomScaleProperty: TReadOnlyProperty<number>;

  //TODO https://github.com/phetsims/my-solar-system/issues/213 document
  public readonly bodyAddedEmitter: TinyEmitter = new TinyEmitter();
  public readonly bodyRemovedEmitter: TinyEmitter = new TinyEmitter();

  // Indicates whether any Body is far from the play area
  public readonly isAnyBodyEscapedProperty: TReadOnlyProperty<boolean>;

  //TODO https://github.com/phetsims/my-solar-system/issues/213 document
  public readonly isAnyBodyCollidedProperty: Property<boolean>;

  // Power of 10 to which the force is scaled
  public readonly forceScaleProperty: NumberProperty;

  // Indicates whether any force arrow is currently off scale
  public readonly isAnyForceOffscaleProperty: TReadOnlyProperty<boolean>;

  protected constructor( providedOptions: SolarSystemCommonModelOptions<EngineType> ) {

    const options = optionize<SolarSystemCommonModelOptions<EngineType>, SelfOptions<EngineType>>()( {
      timeScale: 1,
      modelToViewTime: SolarSystemCommonConstants.TIME_MULTIPLIER
    }, providedOptions );

    this.userControlledProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'userControlledProperty' ),
      phetioReadOnly: true
    } );

    this.defaultBodyInfo = options.defaultBodyInfo;

    // The complete set of Body elements, grouped under a parent tandem, in ascending order of index.
    const bodiesTandem = options.tandem.createTandem( 'availableBodies' );
    this.availableBodies = this.defaultBodyInfo.map( ( bodyInfo, index ) =>
      new Body( index + 1, bodyInfo, this.userControlledProperty, BODY_COLORS[ index ], bodiesTandem.createTandem( `body${index + 1}` ) )
    );
    this.saveStartingBodyInfo();

    this.bodies = createObservableArray( {
      tandem: options.tandem.createTandem( 'bodies' ),
      phetioType: createObservableArray.ObservableArrayIO( Body.BodyIO ),
      phetioDocumentation: 'The set of Body elements that are currently active, and thus visible on the screen'
    } );

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

    this.isAnyBodyCollidedProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'isAnyBodyCollidedProperty' ),
      phetioReadOnly: true
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
            this.saveStartingBodyInfo();
          }
          this.userInteractingEmitter.emit();
          this.userControlledProperty.value = true;
        }
      );
    } );

    this.numberOfActiveBodiesProperty = new NumberProperty( this.bodies.length, {
      numberType: 'Integer',
      range: new Range( 1, this.availableBodies.length ),
      tandem: options.tandem.createTandem( 'numberOfActiveBodiesProperty' )
    } );

    this.engine = options.engineFactory( this.bodies );
    this.engine.reset();

    // Time settings
    this.timeScale = options.timeScale;
    this.modelToViewTime = options.modelToViewTime;

    // Time Properties, grouped under a parent tandem
    const timeTandem = options.tandem.createTandem( 'time' );
    this.timeProperty = new NumberProperty( 0, {
      tandem: timeTandem.createTandem( 'timeProperty' ),
      phetioReadOnly: true
    } );
    this.isPlayingProperty = new BooleanProperty( false, {
      tandem: timeTandem.createTandem( 'isPlayingProperty' )
    } );
    this.timeSpeedProperty = new EnumerationProperty( TimeSpeed.NORMAL, {
      tandem: timeTandem.createTandem( 'timeSpeedProperty' )
    } );
    this.hasPlayedProperty = new BooleanProperty( false, {
      tandem: timeTandem.createTandem( 'hasPlayedProperty' ),
      phetioReadOnly: true
    } );

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
  }

  public saveStartingBodyInfo(): void {
    this.startingBodyInfo = this.availableBodies.map( body => body.info );
  }

  /**
   * Sets availableBodies to have the specified values.
   */
  public loadBodyInfo( bodiesInfo: BodyInfo[], preventCollision = false ): void {
    for ( let i = 0; i < this.availableBodies.length; i++ ) {
      const bodyInfo = bodiesInfo[ i ];

      if ( bodyInfo ) {
        this.availableBodies[ i ].isActiveProperty.value = bodyInfo.isActive;

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

    this.saveStartingBodyInfo();
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
    this.saveStartingBodyInfo();

    this.bodyAddedEmitter.emit();
    this.isAnyBodyCollidedProperty.reset();
  }

  public removeLastBody(): void {
    const lastBody = this.bodies[ this.bodies.length - 1 ];
    lastBody.isActiveProperty.value = false;
    this.saveStartingBodyInfo();

    this.bodyRemovedEmitter.emit();
    this.isAnyBodyCollidedProperty.reset();
  }

  public reset(): void {
    this.isPlayingProperty.value = false; // Pause the sim
    this.timeSpeedProperty.reset();
    this.zoomLevelProperty.reset();
    this.moreDataProperty.reset();
    this.realUnitsProperty.reset();
    this.userControlledProperty.reset();
    this.forceScaleProperty.reset();

    this.startingBodyInfo = this.defaultBodyInfo;

    this.restart();
  }

  // Restart is for when the time controls are brought back to 0
  // Bodies move to their last modified position
  public restart(): void {
    this.isAnyBodyCollidedProperty.reset();
    this.hasPlayedProperty.value = false;
    this.isPlayingProperty.value = false; // Pause the sim
    this.timeProperty.reset(); // Reset the time
    this.loadBodyInfo( this.startingBodyInfo ); // Reset the bodies
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
      if ( this.addingPathPoints ) {
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