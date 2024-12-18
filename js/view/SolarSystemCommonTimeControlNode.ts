// Copyright 2023-2024, University of Colorado Boulder

/**
` * Controls time in MySolarSystem
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import { Shape } from '../../../kite/js/imports.js';
import optionize from '../../../phet-core/js/optionize.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import TimeControlNode, { TimeControlNodeOptions } from '../../../scenery-phet/js/TimeControlNode.js';
import TimeSpeed from '../../../scenery-phet/js/TimeSpeed.js';
import { HBox, Node, Path, Rectangle } from '../../../scenery/js/imports.js';
import SolarSystemCommonStrings from '../../../solar-system-common/js/SolarSystemCommonStrings.js';
import RoundPushButton from '../../../sun/js/buttons/RoundPushButton.js';
import Tandem from '../../../tandem/js/Tandem.js';
import SolarSystemCommonModel from '../model/SolarSystemCommonModel.js';
import solarSystemCommon from '../solarSystemCommon.js';
import SolarSystemCommonColors from '../SolarSystemCommonColors.js';

// constants
const PLAY_PAUSE_BUTTON_RADIUS = 34;
const STEP_BUTTON_RADIUS = 23;
const PUSH_BUTTON_SPACING = 8;


// Restart Icon ---------------------------------------------------------------------------
// constants
const scale = 0.75;
const vscale = 1.15;
const barWidth = 4 * scale;
const barHeight = 19 * scale * vscale;
const triangleWidth = 15 * scale;
const triangleHeight = 19 * scale * vscale;
const barPath = new Rectangle( 0, 0, barWidth, barHeight, { fill: 'black' } );
const trianglePath = new Path( new Shape().moveTo( 0, triangleHeight / 2 ).lineTo( -triangleWidth, 0 ).lineTo( 0, -triangleHeight / 2 ).close(), {
  fill: 'black'
} );
const trianglePath2 = new Path( new Shape().moveTo( 0, triangleHeight / 2 ).lineTo( -triangleWidth, 0 ).lineTo( 0, -triangleHeight / 2 ).close(), {
  fill: 'black'
} );
const restartIcon = new HBox( { children: [ barPath, trianglePath, trianglePath2 ], spacing: -1 } );

type SelfOptions = {
  restartListener: () => void;
  stepForwardListener: () => void;
  speedRadioButtonGroupOnRight?: boolean;
};

type SolarSystemCommonTimeControlNodeOptions = SelfOptions & PickRequired<TimeControlNodeOptions, 'tandem' | 'enabledProperty'>;

export default class SolarSystemCommonTimeControlNode extends TimeControlNode {

  public constructor( model: SolarSystemCommonModel, providedOptions: SolarSystemCommonTimeControlNodeOptions ) {

    const options = optionize<SolarSystemCommonTimeControlNodeOptions, SelfOptions, TimeControlNodeOptions>()( {

      // SelfOptions
      speedRadioButtonGroupOnRight: true,

      // TimeControlNodeOptions
      timeSpeedProperty: model.timeSpeedProperty,
      timeSpeeds: [ TimeSpeed.FAST, TimeSpeed.NORMAL, TimeSpeed.SLOW ],
      scale: 0.9,
      playPauseStepButtonOptions: {
        playPauseStepXSpacing: PUSH_BUTTON_SPACING,
        playPauseButtonOptions: {
          radius: PLAY_PAUSE_BUTTON_RADIUS
        },
        stepForwardButtonOptions: {
          radius: STEP_BUTTON_RADIUS,
          listener: () => {
            model.interruptBodiesSubtreeEmitter.emit();
            providedOptions.stepForwardListener();
          },
          touchAreaDilation: 2
        },
        tandem: Tandem.OPT_OUT
      },
      buttonGroupXSpacing: 20,
      speedRadioButtonGroupOnLeft: false,
      speedRadioButtonGroupOptions: {
        labelOptions: {
          font: new PhetFont( 16 ),
          fill: SolarSystemCommonColors.foregroundProperty
        },
        touchAreaXDilation: 10
      },

      //TODO https://github.com/phetsims/scenery-phet/issues/826 Remove this workaround when TimeControlNode dynamic layout is fixed.
      // Workaround for https://github.com/phetsims/my-solar-system/issues/300. Putting the radio button group in
      // a panel makes the layout behave properly when speedRadioButtonGroup.visibleProperty is set to false via PhET-iO.
      wrapSpeedRadioButtonGroupInPanel: true,
      speedRadioButtonGroupPanelOptions: {
        fill: null,
        stroke: null,
        xMargin: 0,
        yMargin: 0
      }
    }, providedOptions );

    super( model.isPlayingProperty, options );

    const restartButton = new RoundPushButton( {
      content: new Node( { children: [ restartIcon ] } ),
      enabledProperty: model.hasPlayedProperty,
      radius: STEP_BUTTON_RADIUS,
      touchAreaDilation: 2,
      xMargin: 9.5,
      yMargin: 9.5,
      listener: () => model.restart(),
      center: this.getPlayPauseButtonCenter().minusXY( PLAY_PAUSE_BUTTON_RADIUS + STEP_BUTTON_RADIUS + PUSH_BUTTON_SPACING, 0 ),
      layoutOptions: {
        xMargin: 5
      },
      innerContent: SolarSystemCommonStrings.a11y.restartStringProperty,
      tandem: Tandem.OPT_OUT
    } );

    this.addChild( restartButton );
    this.playPauseStepButtons.pdomOrder = [ restartButton, ...( this.playPauseStepButtons.pdomOrder ? this.playPauseStepButtons.pdomOrder : [] ) ];

    //TODO https://github.com/phetsims/scenery-phet/issues/826 Remove this block, set speedRadioButtonGroupPosition: 'bottom'
    // speedRadioButtonGroup is positioned differently on KeplersLaws and MySolarSystem.
    // Here, the position when it's under the play pause step buttons is set as follows:
    // X: Aligned with the play pause step buttons
    // Y: Below the play pause step buttons
    if ( !options.speedRadioButtonGroupOnRight ) {
      this.speedRadioButtonGroupParent!.center = this.getPlayPauseButtonCenter().plusXY(
        -0.9 * ( PLAY_PAUSE_BUTTON_RADIUS + STEP_BUTTON_RADIUS ),
        PLAY_PAUSE_BUTTON_RADIUS + STEP_BUTTON_RADIUS + 3 * PUSH_BUTTON_SPACING
      );
    }
  }
}

solarSystemCommon.register( 'SolarSystemCommonTimeControlNode', SolarSystemCommonTimeControlNode );