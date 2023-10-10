// Copyright 2023, University of Colorado Boulder

/**
 * Checkbox with common options for the my-solar-system and keplers-laws sims
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import Checkbox, { CheckboxOptions } from '../../../sun/js/Checkbox.js';
import { combineOptions, EmptySelfOptions, optionize4 } from '../../../phet-core/js/optionize.js';
import { HBox, Node, Text, TextOptions } from '../../../scenery/js/imports.js';
import Property from '../../../axon/js/Property.js';
import solarSystemCommon from '../solarSystemCommon.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';
import SolarSystemCommonStrings from '../SolarSystemCommonStrings.js';
import GridNode from '../../../scenery-phet/js/GridNode.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import SolarSystemCommonColors from '../SolarSystemCommonColors.js';
import Tandem from '../../../tandem/js/Tandem.js';
import MeasuringTapeNode from '../../../scenery-phet/js/MeasuringTapeNode.js';
import ArrowNode from '../../../scenery-phet/js/ArrowNode.js';

const TEXT_OPTIONS = combineOptions<TextOptions>( {}, SolarSystemCommonConstants.TEXT_OPTIONS, {
  maxWidth: SolarSystemCommonConstants.CHECKBOX_TEXT_MAX_WIDTH
} );
const TEXT_ICON_SPACING = 10;
const ARROW_Y_COORDINATE = -10;

type SelfOptions = EmptySelfOptions;

export type SolarSystemCommonCheckboxOptions = SelfOptions & CheckboxOptions;

export default class SolarSystemCommonCheckbox extends Checkbox {

  public constructor( property: Property<boolean>, content: Node, providedOptions?: SolarSystemCommonCheckboxOptions ) {

    const options = optionize4<SolarSystemCommonCheckboxOptions, SelfOptions, CheckboxOptions>()(
      {}, SolarSystemCommonConstants.CHECKBOX_OPTIONS, {

        // CheckboxOptions
        touchAreaXDilation: 5,
        touchAreaYDilation: SolarSystemCommonConstants.CHECKBOX_SPACING / 2,
        containerTagName: 'div' // Just for easier visualization in a11y view
      }, providedOptions );

    super( property, content, options );
  }

  public static readonly TEXT_OPTIONS = TEXT_OPTIONS;

  public static readonly TEXT_ICON_SPACING = TEXT_ICON_SPACING;

  /**
   * Creates the 'Speed' checkbox
   */
  public static createSpeedCheckbox( speedVisibleProperty: Property<boolean>, tandem: Tandem ): SolarSystemCommonCheckbox {

    const text = new Text( SolarSystemCommonStrings.speedStringProperty, TEXT_OPTIONS );

    return new SolarSystemCommonCheckbox( speedVisibleProperty, text, {
      accessibleName: SolarSystemCommonStrings.speedStringProperty,
      tandem: tandem.createTandem( 'speedCheckbox' )
    } );
  }

  /**
   * Creates the 'Velocity' checkbox
   */
  public static createVelocityCheckbox( velocityVisibleProperty: Property<boolean>, tandem: Tandem ): SolarSystemCommonCheckbox {

    const text = new Text( SolarSystemCommonStrings.velocityStringProperty, TEXT_OPTIONS );
    const icon = new ArrowNode( 95, ARROW_Y_COORDINATE, 140, ARROW_Y_COORDINATE, {
      fill: SolarSystemCommonColors.velocityColorProperty
    } );

    const content = new HBox( {
      children: [ text, icon ],
      spacing: TEXT_ICON_SPACING
    } );

    return new SolarSystemCommonCheckbox( velocityVisibleProperty, content, {
      accessibleName: SolarSystemCommonStrings.velocityStringProperty,
      tandem: tandem.createTandem( 'velocityCheckbox' )
    } );
  }

  /**
   * Creates the 'Gravity Force' checkbox
   */
  public static createGravityForceCheckbox( gravityForceVisibleProperty: Property<boolean>, tandem: Tandem ): SolarSystemCommonCheckbox {

    const text = new Text( SolarSystemCommonStrings.gravityForceStringProperty, TEXT_OPTIONS );
    const icon = new ArrowNode( 135, ARROW_Y_COORDINATE, 180, ARROW_Y_COORDINATE, {
      fill: SolarSystemCommonColors.gravityColorProperty
    } );

    const content = new HBox( {
      children: [ text, icon ],
      spacing: TEXT_ICON_SPACING
    } );

    return new SolarSystemCommonCheckbox( gravityForceVisibleProperty, content, {
      accessibleName: SolarSystemCommonStrings.gravityForceStringProperty,
      tandem: tandem.createTandem( 'gravityForceCheckbox' )
    } );
  }

  /**
   * Creates the 'Grid' checkbox
   */
  public static createGridCheckbox( gridVisibleProperty: Property<boolean>, tandem: Tandem ): SolarSystemCommonCheckbox {

    const text = new Text( SolarSystemCommonStrings.gridStringProperty, TEXT_OPTIONS );
    const icon = new GridNode( new Property( ModelViewTransform2.createIdentity() ), 10, Vector2.ZERO, 1, {
      stroke: SolarSystemCommonColors.gridIconStrokeColorProperty,
      lineWidth: 1.5
    } );

    const content = new HBox( {
      children: [ text, icon ],
      spacing: TEXT_ICON_SPACING
    } );

    return new SolarSystemCommonCheckbox( gridVisibleProperty, content, {
      accessibleName: SolarSystemCommonStrings.gridStringProperty,
      tandem: tandem
    } );
  }

  /**
   * Creates the 'Measuring Tape' checkbox
   */
  public static createMeasuringTapeCheckbox( measuringTapeVisibleProperty: Property<boolean>, tandem: Tandem ): SolarSystemCommonCheckbox {

    const text = new Text( SolarSystemCommonStrings.measuringTapeStringProperty, TEXT_OPTIONS );
    const icon = MeasuringTapeNode.createIcon( { scale: 0.3 } );

    const content = new HBox( {
      children: [ text, icon ],
      spacing: TEXT_ICON_SPACING
    } );

    return new SolarSystemCommonCheckbox( measuringTapeVisibleProperty, content, {
      accessibleName: SolarSystemCommonStrings.measuringTapeStringProperty,
      tandem: tandem.createTandem( 'measuringTapeCheckbox' )
    } );
  }
}

solarSystemCommon.register( 'SolarSystemCommonCheckbox', SolarSystemCommonCheckbox );
