// Copyright 2023, University of Colorado Boulder

/**
 * Visual representation of space object's property checkbox.
 *
 * @author Agustín Vallejo
 */

import { HBox, Text, TextOptions } from '../../../scenery/js/imports.js';
import MySolarSystemStrings from '../../../my-solar-system/js/MySolarSystemStrings.js';
import SolarSystemCommonColors from '../SolarSystemCommonColors.js';
import GridNode from '../../../scenery-phet/js/GridNode.js';
import Property from '../../../axon/js/Property.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';
import CommonModel from '../model/CommonModel.js';
import MeasuringTapeNode from '../../../scenery-phet/js/MeasuringTapeNode.js';
import SolarSystemCommonCheckbox from './SolarSystemCommonCheckbox.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
import solarSystemCommon from '../solarSystemCommon.js';

// constants
const TEXT_OPTIONS = combineOptions<TextOptions>( {
  maxWidth: 200
}, SolarSystemCommonConstants.TEXT_OPTIONS );

const createVisibilityInformationCheckboxes = ( model: CommonModel, tandem: Tandem ): SolarSystemCommonCheckbox[] => {

  const measuringTapeIcon = MeasuringTapeNode.createIcon( { scale: 0.3 } );

  return [
    new SolarSystemCommonCheckbox( model.gridVisibleProperty, new HBox( {
      spacing: 10,
      children: [
        new Text( MySolarSystemStrings.gridStringProperty, TEXT_OPTIONS ),
        new GridNode( new Property( ModelViewTransform2.createIdentity() ), 10, Vector2.ZERO, 1, {
          stroke: SolarSystemCommonColors.gridIconStrokeColorProperty,
          lineWidth: 1.5
        } )
      ]
    } ), {
      tandem: tandem.createTandem( 'gridVisibleCheckbox' )
    } ),
    new SolarSystemCommonCheckbox( model.measuringTapeVisibleProperty, new HBox( {
      spacing: 10,
      children: [
        new Text( MySolarSystemStrings.measuringTapeStringProperty, TEXT_OPTIONS ),
        measuringTapeIcon
      ]
    } ), {
      tandem: tandem.createTandem( 'measuringTapeVisibleCheckbox' )
    } )
  ];
};

solarSystemCommon.register( 'createVisibilityInformationCheckboxes', createVisibilityInformationCheckboxes );
export default createVisibilityInformationCheckboxes;