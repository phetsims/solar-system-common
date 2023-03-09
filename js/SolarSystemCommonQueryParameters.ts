// Copyright 2023, University of Colorado Boulder

/**
 * SolarSystemCommonQueryParameters defines query parameters that are specific to this simulation.
 *
 * @author Agustín Vallejo
 */

import solarSystemCommon from './solarSystemCommon.js';

const SolarSystemCommonQueryParameters = QueryStringMachine.getAll( {

  // Boolean that controls if the cueing arrow node is visible or not
  cueingArrows: {
    type: 'boolean',
    defaultValue: false
    //REVIEW: Is this public or not? It should be noted as such in the schema (see QueryStringMachine docs)
  }
} );

solarSystemCommon.register( 'SolarSystemCommonQueryParameters', SolarSystemCommonQueryParameters );
export default SolarSystemCommonQueryParameters;