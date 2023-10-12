// Copyright 2023, University of Colorado Boulder

/**
 * Screen view for the My Solar System Screen
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import Vector2 from '../../../dot/js/Vector2.js';
import Multilink from '../../../axon/js/Multilink.js';
import ScreenView, { ScreenViewOptions } from '../../../joist/js/ScreenView.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../scenery-phet/js/buttons/ResetAllButton.js';
import { Node, Path } from '../../../scenery/js/imports.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';
import SolarSystemCommonModel from '../model/SolarSystemCommonModel.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import SolarSystemCommonStrings from '../../../solar-system-common/js/SolarSystemCommonStrings.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import MeasuringTapeNode from '../../../scenery-phet/js/MeasuringTapeNode.js';
import Property from '../../../axon/js/Property.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import Body from '../model/Body.js';
import DraggableVelocityVectorNode, { DraggableVectorNodeOptions } from './DraggableVelocityVectorNode.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import solarSystemCommon from '../solarSystemCommon.js';
import BodySoundManager from './BodySoundManager.js';
import GridNode from '../../../scenery-phet/js/GridNode.js';
import SolarSystemCommonColors from '../SolarSystemCommonColors.js';
import SoundClip from '../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../tambo/js/soundManager.js';
import Grab_Sound_mp3 from '../../sounds/Grab_Sound_mp3.js';
import Release_Sound_mp3 from '../../sounds/Release_Sound_mp3.js';
import { Shape } from '../../../kite/js/imports.js';
import SolarSystemCommonVisibleProperties from './SolarSystemCommonVisibleProperties.js';

export type BodyBoundsItem = {
  node: Node;
  expandX: 'left' | 'right';
  expandY: 'top' | 'bottom';
};

type SelfOptions = {
  playingAllowedProperty?: TReadOnlyProperty<boolean>;
  centerOrbitOffset?: Vector2;
};

export type SolarSystemCommonScreenViewOptions = SelfOptions & ScreenViewOptions;

export default class SolarSystemCommonScreenView<GenericVisibleProperties extends SolarSystemCommonVisibleProperties> extends ScreenView {

  //TODO https://github.com/phetsims/my-solar-system/issues/213 document - I'm having to guess at what these layers are for.
  protected readonly bodiesLayer = new Node();
  protected readonly componentsLayer = new Node();
  protected readonly interfaceLayer = new Node();
  protected readonly topLayer = new Node();
  protected readonly bottomLayer = new Node();

  //TODO https://github.com/phetsims/my-solar-system/issues/213 document
  protected readonly bodySoundManager: BodySoundManager;

  //TODO https://github.com/phetsims/my-solar-system/issues/213 document
  protected readonly createDraggableVelocityVectorNode: ( body: Body, options?: DraggableVectorNodeOptions ) => DraggableVelocityVectorNode;

  //TODO https://github.com/phetsims/my-solar-system/issues/213 document - for what?
  protected readonly modelViewTransformProperty: TReadOnlyProperty<ModelViewTransform2>;

  // Derived from visibleBoundsProperty to keep the UI elements centered on narrow screens
  // Tracks only the vertical bounds and constrains them to layoutBounds
  protected readonly availableBoundsProperty: TReadOnlyProperty<Bounds2>;

  protected readonly resetAllButton: ResetAllButton;

  protected readonly measuringTapeNode: MeasuringTapeNode;

  //TODO https://github.com/phetsims/my-solar-system/issues/213 document
  private readonly dragDebugPath: Path;

  protected constructor(
    public readonly model: SolarSystemCommonModel,
    public readonly visibleProperties: GenericVisibleProperties,
    providedOptions: SolarSystemCommonScreenViewOptions ) {

    const options = optionize<SolarSystemCommonScreenViewOptions, SelfOptions, ScreenViewOptions>()( {
      // SelfOptions
      playingAllowedProperty: new Property( true ),
      centerOrbitOffset: Vector2.ZERO
    }, providedOptions );

    super( options );

    this.dragDebugPath = new Path( null, {
      stroke: 'red',
      fill: 'rgba(255,0,0,0.2)'
    } );
    if ( phet.chipper.queryParameters.dev ) {
      this.addChild( this.dragDebugPath );
    }

    this.availableBoundsProperty = new DerivedProperty(
      [ this.visibleBoundsProperty ],
      visibleBounds => {
        return visibleBounds.withMinY( this.layoutBounds.minY ).withMaxY( this.layoutBounds.maxY );
      }
    );

    this.addChild( this.bottomLayer );
    this.addChild( this.bodiesLayer );
    this.addChild( this.componentsLayer );
    this.addChild( this.interfaceLayer );
    this.addChild( this.topLayer );

    this.pdomPlayAreaNode.pdomOrder = [
      this.bodiesLayer,
      this.componentsLayer,
      this.topLayer
    ];

    this.pdomControlAreaNode.pdomOrder = [
      this.bottomLayer,
      this.interfaceLayer
    ];

    this.bodySoundManager = new BodySoundManager( model );
    model.availableBodies.forEach( body => {
      body.collidedEmitter.addListener( () => {
        this.bodySoundManager.playBodyRemovedSound( 3 ); // Plays the collision sound instead of body index
      } );
    } );

    this.modelViewTransformProperty = new DerivedProperty(
      [ model.zoomScaleProperty ],
      zoomScale => {
        return ModelViewTransform2.createSinglePointScaleInvertedYMapping(
          Vector2.ZERO,
          new Vector2(
            this.layoutBounds.center.x - options.centerOrbitOffset.x,
            this.layoutBounds.center.y - options.centerOrbitOffset.y ),
          zoomScale );
      } );

    // Add the node for the overlay grid, setting its visibility based on the model.showGridProperty
    this.interfaceLayer.addChild( new GridNode(
      this.modelViewTransformProperty,
      SolarSystemCommonConstants.GRID_SPACING,
      Vector2.ZERO,
      100,
      {
        stroke: SolarSystemCommonColors.gridIconStrokeColorProperty,
        visibleProperty: this.visibleProperties.gridVisibleProperty,
        tandem: options.tandem.createTandem( 'gridNode' )
      } ) );

    this.createDraggableVelocityVectorNode = ( body: Body, options?: DraggableVectorNodeOptions ) => {
      return new DraggableVelocityVectorNode(
        body,
        this.modelViewTransformProperty,
        this.visibleProperties.velocityVisibleProperty,
        body.velocityProperty,
        body.positionProperty,
        SolarSystemCommonStrings.VStringProperty,
        combineOptions<DraggableVectorNodeOptions>( {
          fill: SolarSystemCommonColors.velocityColorProperty,
          soundViewNode: this,
          mapPosition: this.constrainBoundaryViewPoint.bind( this )
        }, options )
      );
    };

    // UI Elements ===================================================================================================

    const dragClipOptions = {
      initialOutputLevel: 2 * SolarSystemCommonConstants.DEFAULT_SOUND_OUTPUT_LEVEL
    };
    const grabClip = new SoundClip( Grab_Sound_mp3, dragClipOptions );
    const releaseClip = new SoundClip( Release_Sound_mp3, dragClipOptions );
    soundManager.addSoundGenerator( grabClip );
    soundManager.addSoundGenerator( releaseClip );

    // Measuring tape units must update dynamically when AUStringProperty changes.
    const measuringTapeUnitsProperty = new DerivedProperty( [ SolarSystemCommonStrings.units.AUStringProperty ],
      AUString => {
        return { name: AUString, multiplier: 0.01 };
      } );

    // Add the MeasuringTapeNode
    this.measuringTapeNode = new MeasuringTapeNode( measuringTapeUnitsProperty, {
      visibleProperty: this.visibleProperties.measuringTapeVisibleProperty,
      textColor: 'black',
      textBackgroundColor: 'rgba( 255, 255, 255, 0.5 )', // translucent red
      textBackgroundXMargin: 10,
      textBackgroundYMargin: 3,
      textBackgroundCornerRadius: 5,
      basePositionProperty: new Vector2Property( new Vector2( 0, 100 ) ),
      tipPositionProperty: new Vector2Property( new Vector2( 100, 100 ) ),
      significantFigures: 2,
      baseDragStarted: () => grabClip.play(),
      baseDragEnded: () => releaseClip.play(),
      keyboardDragListenerOptions: {
        baseShiftDragVelocity: 100,
        tipShiftDragVelocity: 100
      },
      tandem: providedOptions.tandem.createTandem( 'measuringTapeNode' )
    } );
    this.topLayer.addChild( this.measuringTapeNode );

    // NOTE: It is the responsibility of the subclass to add resetAllButton to the scene graph.
    this.resetAllButton = new ResetAllButton( {
      listener: () => {
        model.reset();
        this.reset();
      },
      touchAreaDilation: 10,
      tandem: providedOptions.tandem.createTandem( 'resetAllButton' )
    } );
    this.visibleBoundsProperty.link( visibleBounds => {
      this.resetAllButton.right = visibleBounds.right - SolarSystemCommonConstants.SCREEN_VIEW_X_MARGIN;
      this.resetAllButton.bottom = visibleBounds.bottom - SolarSystemCommonConstants.SCREEN_VIEW_Y_MARGIN;
    } );

    Multilink.multilink(
      [ this.visibleBoundsProperty, this.modelViewTransformProperty ],
      ( visibleBounds, modelViewTransform ) => {
        this.measuringTapeNode.setDragBounds( modelViewTransform.viewToModelBounds( visibleBounds.eroded( 10 ) ) );
        this.measuringTapeNode.modelViewTransformProperty.value = modelViewTransform;
      }
    );
  }

  /**
   * Return the bounds items that should be used to constrain the areas for body dragging.
   */
  protected getBodyBoundsItems(): BodyBoundsItem[] {
    return [
      {
        node: this.resetAllButton,
        expandX: 'right',
        expandY: 'bottom'
      }
    ];
  }

  protected constrainBoundaryViewPoint( point: Vector2, radius: number ): Vector2 {

    const bodyBoundsItems = this.getBodyBoundsItems();

    if ( !_.every( [ this.dragDebugPath, ...bodyBoundsItems.map( item => item.node ) ] ) ) {
      return point;
    }

    const mvt = this.modelViewTransformProperty.value;

    const expandToTop = ( bounds: Bounds2 ) => bounds.withMinY( this.layoutBounds.minY );
    const expandToBottom = ( bounds: Bounds2 ) => bounds.withMaxY( this.layoutBounds.maxY );
    const expandToLeft = ( bounds: Bounds2 ) => bounds.withMinX( this.visibleBoundsProperty.value.minX );
    const expandToRight = ( bounds: Bounds2 ) => bounds.withMaxX( this.visibleBoundsProperty.value.maxX );

    // Use visible bounds (horizontally) and layout bounds (vertically) to create the main shape
    let shape = Shape.bounds( mvt.viewToModelBounds( expandToLeft( expandToRight( this.layoutBounds ) ).eroded( radius ) ) );

    bodyBoundsItems.forEach( item => {
      if ( item.node.visible ) {
        let viewBounds = this.boundsOf( item.node );
        if ( viewBounds.isValid() ) {
          if ( item.expandX === 'left' ) {
            viewBounds = expandToLeft( viewBounds );
          }
          else if ( item.expandX === 'right' ) {
            viewBounds = expandToRight( viewBounds );
          }

          if ( item.expandY === 'top' ) {
            viewBounds = expandToTop( viewBounds );
          }
          else if ( item.expandY === 'bottom' ) {
            viewBounds = expandToBottom( viewBounds );
          }

          const modelBounds = mvt.viewToModelBounds( viewBounds.dilated( radius ) );

          shape = shape.shapeDifference( Shape.bounds( modelBounds ) );
        }
      }
    } );

    // Only show drag debug path if ?dev is specified, temporarily for https://github.com/phetsims/my-solar-system/issues/129
    if ( phet.chipper.queryParameters.dev ) {
      this.dragDebugPath.shape = mvt.modelToViewShape( shape );
    }

    if ( shape.containsPoint( point ) || shape.getArea() === 0 ) {
      return point;
    }
    else {
      return shape.getClosestPoint( point );
    }
  }

  public reset(): void {
    this.interruptSubtreeInput(); // cancel interactions that may be in progress
    this.measuringTapeNode.reset();
    this.visibleProperties.reset();
  }
}

solarSystemCommon.register( 'SolarSystemCommonScreenView', SolarSystemCommonScreenView );