// Copyright 2023, University of Colorado Boulder

/**
 * QUnit tests for Units
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { G, G_ACTUAL, MASS_MULTIPLIER, METERS_PER_AU, POSITION_MULTIPLIER, SECONDS_PER_YEAR, TIME_MULTIPLIER } from '../SolarSystemCommonConstants.js';

QUnit.module( 'UnitsTests' );

QUnit.test( 'Test units', assert => {
  assert.ok( true, 'initial test' );

  const mass1 = 123; // kg
  const mass2 = 456; // kg
  const distance = 999; // m
  const gravityForce = G_ACTUAL * mass1 * mass2 / ( distance * distance ); // N
  console.log( gravityForce );

  const mass1SimUnits = mass1 / MASS_MULTIPLIER;
  const mass2SimUnits = mass2 / MASS_MULTIPLIER;
  const distanceSimUnits = distance / METERS_PER_AU / POSITION_MULTIPLIER;
  const gravityForceSimUnits = G * mass1SimUnits * mass2SimUnits / ( distanceSimUnits * distanceSimUnits );

  // convert gravityForceSimUnits to SI
  const convertedToSI = gravityForceSimUnits * MASS_MULTIPLIER * POSITION_MULTIPLIER * METERS_PER_AU / TIME_MULTIPLIER / TIME_MULTIPLIER / SECONDS_PER_YEAR / SECONDS_PER_YEAR;
  console.log( convertedToSI );

  assert.ok( Math.abs( gravityForce - convertedToSI ) < 1e-10, 'gravityForce should be the same' );
} );

