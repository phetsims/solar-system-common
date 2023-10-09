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

  // Indicates if the gravity arrows are visible.
  public readonly gravityVisibleProperty: BooleanProperty;

  // Indicates if the velocity arrows are visible.
  public readonly velocityVisibleProperty: BooleanProperty;

  // Indicates if the grid is visible.
  public readonly gridVisibleProperty: BooleanProperty;

  // Indicates if the measuring tape is visible.
  public readonly measuringTapeVisibleProperty: BooleanProperty;

  // Indicates if the speed values are visible. TODO: refactor to speedVisibleProperty https://github.com/phetsims/my-solar-system/issues/219
  public readonly valuesVisibleProperty: BooleanProperty;

  public constructor( tandem: Tandem ) {

    // Properties that control visibility of things in the UI, controlled by checkboxes, grouped under a parent tandem
    this.gravityVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'gravityVisibleProperty' )
    } );
    this.velocityVisibleProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'velocityVisibleProperty' )
    } );
    this.gridVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'gridVisibleProperty' )
    } );
    this.measuringTapeVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'measuringTapeVisibleProperty' )
    } );
    this.valuesVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'valuesVisibleProperty' )
    } );
  }

  public reset(): void {
    this.gravityVisibleProperty.reset();
    this.velocityVisibleProperty.reset();
    this.gridVisibleProperty.reset();
    this.measuringTapeVisibleProperty.reset();
    this.valuesVisibleProperty.reset();
  }
}

solarSystemCommon.register( 'VisibleProperties', VisibleProperties );