// Copyright 2023, University of Colorado Boulder

/**
 * Creates checkboxes that change the visibility of the different model attributes.
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import { colorProfileProperty, HBox, Image, SceneryConstants, Text, TextOptions } from '../../../scenery/js/imports.js';
import SolarSystemCommonStrings from '../../../solar-system-common/js/SolarSystemCommonStrings.js';
import SolarSystemCommonColors from '../SolarSystemCommonColors.js';
import GridNode from '../../../scenery-phet/js/GridNode.js';
import Property from '../../../axon/js/Property.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';
import MeasuringTapeNode from '../../../scenery-phet/js/MeasuringTapeNode.js';
import SolarSystemCommonCheckbox from './SolarSystemCommonCheckbox.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
import solarSystemCommon from '../solarSystemCommon.js';
import pathIcon_png from '../../images/pathIcon_png.js';
import pathIconProjector_png from '../../images/pathIconProjector_png.js';
import VisibleProperties from './VisibleProperties.js';
import BooleanProperty from '../../../axon/js/BooleanProperty.js';

// constants
const TEXT_OPTIONS = combineOptions<TextOptions>( {}, SolarSystemCommonConstants.TEXT_OPTIONS, {
  maxWidth: SolarSystemCommonConstants.CHECKBOX_TEXT_MAX_WIDTH
} );

/**
 * Creates checkboxes that change the visibility of the different model attributes like the grid, measuring tape, etc.
 * @param visibleProperties
 * @param pathVisibleProperty - this property lives in the model, it's separate to visibleProperties
 * @param tandem
 */
const createVisibilityInformationCheckboxes = ( visibleProperties: VisibleProperties, pathVisibleProperty: BooleanProperty, tandem: Tandem ): SolarSystemCommonCheckbox[] => {

  const measuringTapeIcon = MeasuringTapeNode.createIcon( { scale: 0.3 } );

  const pathIconImageNode = new Image( pathIcon_png, { scale: 0.25 } );
  colorProfileProperty.lazyLink( ( profileName: string ) => {
    assert && assert( profileName === SceneryConstants.DEFAULT_COLOR_PROFILE || profileName === SceneryConstants.PROJECTOR_COLOR_PROFILE );
    pathIconImageNode.setImage( profileName === SceneryConstants.PROJECTOR_COLOR_PROFILE ? pathIconProjector_png : pathIcon_png );
  } );

  return [
    new SolarSystemCommonCheckbox( visibleProperties.gridVisibleProperty, new HBox( {
      spacing: 10,
      children: [
        new Text( SolarSystemCommonStrings.gridStringProperty, TEXT_OPTIONS ),
        new GridNode( new Property( ModelViewTransform2.createIdentity() ), 10, Vector2.ZERO, 1, {
          stroke: SolarSystemCommonColors.gridIconStrokeColorProperty,
          lineWidth: 1.5
        } )
      ]
    } ), {
      accessibleName: SolarSystemCommonStrings.gridStringProperty,
      tandem: tandem.createTandem( 'gridCheckbox' )
    } ),
    new SolarSystemCommonCheckbox( visibleProperties.measuringTapeVisibleProperty, new HBox( {
      spacing: 10,
      children: [
        new Text( SolarSystemCommonStrings.measuringTapeStringProperty, TEXT_OPTIONS ),
        measuringTapeIcon
      ]
    } ), {
      accessibleName: SolarSystemCommonStrings.measuringTapeStringProperty,
      tandem: tandem.createTandem( 'measuringTapeCheckbox' )
    } )
  ];
};

solarSystemCommon.register( 'createVisibilityInformationCheckboxes', createVisibilityInformationCheckboxes );
export default createVisibilityInformationCheckboxes;