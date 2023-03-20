// Copyright 2022, University of Colorado Boulder

/**
 * QUnit tests for Units
 *
 * @author Agustin Vallejo (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { G, G_ACTUAL, MASS_MULTIPLIER, POSITION_MULTIPLIER, TIME_MULTIPLIER } from '../SolarSystemCommonConstants.js';

QUnit.module( 'UnitsTests' );

QUnit.test( 'Test units', assert => {
  assert.ok( true, 'initial test' );

  const mass1 = 123; // kg
  const mass2 = 456; // kg
  const distance = 999; // m
  const force = G_ACTUAL * mass1 * mass2 / ( distance * distance ); // N
  console.log( force );

  const mass1SimUnits = mass1 / MASS_MULTIPLIER;
  const mass2SimUnits = mass2 / MASS_MULTIPLIER;
  const distanceSimUnits = distance / POSITION_MULTIPLIER;
  const forceSimUnits = G * mass1SimUnits * mass2SimUnits / ( distanceSimUnits * distanceSimUnits );

  // convert forceSimUnits to SI
  const convertedToSI = forceSimUnits * MASS_MULTIPLIER * POSITION_MULTIPLIER / TIME_MULTIPLIER / TIME_MULTIPLIER;
  console.log( convertedToSI );

  // assert.ok( Math.abs( force - convertedToSI ) < 1e-4, 'force should be the same' );
} );

