// Copyright 2023, University of Colorado Boulder

/**
 * VisibleProperties contains visibleProperty instances for things in the view. These Properties are controlled
 * by checkboxes and toggle buttons.
 *
 * @author Agustín Vallejo
 */

import solarSystemCommon from '../solarSystemCommon.js';
import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Tandem from '../../../tandem/js/Tandem.js';

export default class VisibleProperties {

  // Indicates if the speed values are visible.
  public readonly speedVisibleProperty: BooleanProperty;

  // Indicates if the velocity arrows are visible.
  public readonly velocityVisibleProperty: BooleanProperty;

  // Indicates if the gravity arrows are visible.
  public readonly gravityVisibleProperty: BooleanProperty;

  // Indicates if the path is visible. Lives in the model because it's also linked to model properties.
  public readonly pathVisibleProperty: BooleanProperty;

  // Indicates if the grid is visible.
  public readonly gridVisibleProperty: BooleanProperty;

  // Indicates if the measuring tape is visible.
  public readonly measuringTapeVisibleProperty: BooleanProperty;


  public constructor( tandem: Tandem ) {

    // Properties that control visibility of things in the UI, controlled by checkboxes, grouped under a parent tandem

    this.speedVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'speedVisibleProperty' )
    } );
    this.velocityVisibleProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'velocityVisibleProperty' )
    } );
    this.gravityVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'gravityVisibleProperty' )
    } );
    this.pathVisibleProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'pathVisibleProperty' )
    } );
    this.gridVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'gridVisibleProperty' )
    } );
    this.measuringTapeVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'measuringTapeVisibleProperty' )
    } );

  }

  public reset(): void {
    this.speedVisibleProperty.reset();
    this.velocityVisibleProperty.reset();
    this.gravityVisibleProperty.reset();
    this.pathVisibleProperty.reset();
    this.gridVisibleProperty.reset();
    this.measuringTapeVisibleProperty.reset();
  }
}

solarSystemCommon.register( 'VisibleProperties', VisibleProperties );