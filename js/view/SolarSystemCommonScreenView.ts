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
import optionize from '../../../phet-core/js/optionize.js';
import MeasuringTapeNode from '../../../scenery-phet/js/MeasuringTapeNode.js';
import Property from '../../../axon/js/Property.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import solarSystemCommon from '../solarSystemCommon.js';
import BodySoundManager from './BodySoundManager.js';
import SoundClip from '../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../tambo/js/soundManager.js';
import Grab_Sound_mp3 from '../../sounds/Grab_Sound_mp3.js';
import Release_Sound_mp3 from '../../sounds/Release_Sound_mp3.js';
import { Shape } from '../../../kite/js/imports.js';
import SolarSystemCommonVisibleProperties from './SolarSystemCommonVisibleProperties.js';
import SolarSystemCommonGridNode from './SolarSystemCommonGridNode.js';

export type DragBoundsItem = {
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

  // Layers are used to set the z-index of elements in the sim, so that they are drawn in the correct order.
  protected readonly bottomLayer = new Node(); // Background layer
  protected readonly bodiesLayer = new Node(); // Layer for the bodies
  protected readonly componentsLayer = new Node(); // Layer for the components, e.g. vectors and paths
  protected readonly interfaceLayer = new Node(); // Mostly UI elements
  protected readonly topLayer = new Node(); // Anything that should be drawn on top of everything else, e.g. measuring tape

  // Object that handles the logic for most sounds in the sim
  protected readonly bodySoundManager: BodySoundManager;

  // Transforms between model coordinates and view coordinates
  protected readonly modelViewTransformProperty: TReadOnlyProperty<ModelViewTransform2>;

  // Used for layout of UI elements, mostly things in interfaceLayer. Matches visibleBounds horizontally, layoutBounds vertically.
  protected readonly interfaceBoundsProperty: TReadOnlyProperty<Bounds2>;

  protected readonly resetAllButton: ResetAllButton;

  protected readonly measuringTapeNode: MeasuringTapeNode;

  // Used with the &dev query parameter, shows the path that the body is constrained to when dragging
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

    // Show dragDebugPath if running with &dev. Shape is set by constrainBoundaryViewPoint.
    this.dragDebugPath = new Path( null, {
      stroke: 'red',
      fill: 'rgba( 255, 0, 0, 0.2 )'
    } );
    if ( phet.chipper.queryParameters.dev ) {
      this.addChild( this.dragDebugPath );
    }

    // Matches visibleBounds horizontally, layoutBounds vertically
    this.interfaceBoundsProperty = new DerivedProperty( [ this.visibleBoundsProperty ],
      visibleBounds => visibleBounds.withMinY( this.layoutBounds.minY ).withMaxY( this.layoutBounds.maxY )
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
    model.bodies.forEach( body => {
      body.collidedEmitter.addListener( () => {
        this.bodySoundManager.playBodyCollidedSound();
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
    const gridNode = new SolarSystemCommonGridNode(
      this.modelViewTransformProperty,
      SolarSystemCommonConstants.GRID_SPACING, // spacing
      Vector2.ZERO, // center
      60, // numberOfGridLines
      {
        tandem: options.tandem.createTandem( 'gridNode' ),
        visibleProperty: this.visibleProperties.gridVisibleProperty,
        boldOriginAxes: true
      }
    );
    this.interfaceLayer.addChild( gridNode );

    // Sound =========================================================================================================

    // Sounds used for draggable UI elements
    const dragClipOptions = {
      initialOutputLevel: SolarSystemCommonConstants.DEFAULT_SOUND_OUTPUT_LEVEL
    };
    const grabClip = new SoundClip( Grab_Sound_mp3, dragClipOptions );
    const releaseClip = new SoundClip( Release_Sound_mp3, dragClipOptions );
    soundManager.addSoundGenerator( grabClip );
    soundManager.addSoundGenerator( releaseClip );

    // UI Elements ===================================================================================================

    // Measuring tape units must update dynamically when AUStringProperty changes.
    const measuringTapeUnitsProperty = new DerivedProperty( [ SolarSystemCommonStrings.units.AUStringProperty ],
      AUString => {
        return { name: AUString, multiplier: 1 };
      } );

    // Add the MeasuringTapeNode
    this.measuringTapeNode = new MeasuringTapeNode( measuringTapeUnitsProperty, {
      basePositionProperty: model.measuringTape.basePositionProperty,
      tipPositionProperty: model.measuringTape.tipPositionProperty,
      visibleProperty: this.visibleProperties.measuringTapeVisibleProperty,
      textColor: 'black',
      textBackgroundColor: 'rgba( 255, 255, 255, 0.5 )', // translucent white
      textBackgroundXMargin: 10,
      textBackgroundYMargin: 3,
      textBackgroundCornerRadius: 5,
      significantFigures: 2,
      baseDragStarted: () => grabClip.play(),
      baseDragEnded: () => releaseClip.play(),
      keyboardDragListenerOptions: {
        baseShiftDragVelocity: 100,
        tipShiftDragVelocity: 100
      },
      tandem: providedOptions.tandem.createTandem( 'measuringTapeNode' ),
      phetioFeatured: true,
      phetioReadoutStringPropertyInstrumented: false,
      phetioFeaturedMeasuredDistanceProperty: true
    } );
    this.topLayer.addChild( this.measuringTapeNode );
    this.measuringTapeNode.addLinkedElement( model.measuringTape );

    // Constrain dragging of measuringTapeNode to visibleBounds.
    Multilink.multilink(
      [ this.visibleBoundsProperty, this.modelViewTransformProperty ],
      ( visibleBounds, modelViewTransform ) => {
        this.measuringTapeNode.setDragBounds( modelViewTransform.viewToModelBounds( visibleBounds.eroded( 10 ) ) );
        this.measuringTapeNode.modelViewTransformProperty.value = modelViewTransform;
      }
    );

    // NOTE: It is the responsibility of the subclass to add resetAllButton to the scene graph.
    this.resetAllButton = new ResetAllButton( {
      listener: () => {
        model.reset();
        this.reset();
      },
      touchAreaDilation: 10,
      tandem: providedOptions.tandem.createTandem( 'resetAllButton' )
    } );
    this.interfaceBoundsProperty.link( interfaceBounds => {
      this.resetAllButton.right = interfaceBounds.right - SolarSystemCommonConstants.SCREEN_VIEW_X_MARGIN;
      this.resetAllButton.bottom = interfaceBounds.bottom - SolarSystemCommonConstants.SCREEN_VIEW_Y_MARGIN;
    } );
  }

  public reset(): void {
    this.interruptSubtreeInput(); // cancel interactions that may be in progress
    this.visibleProperties.reset();
  }

  /**
   * Return the bounds items that should be used to constrain the areas for dragging.
   */
  protected getDragBoundsItems(): DragBoundsItem[] {
    return [
      {
        node: this.resetAllButton,
        expandX: 'right',
        expandY: 'bottom'
      }
    ];
  }

  /**
   * Constrains dragging of BodyNode and DraggableVectorNode instances.
   * @param point - the drag point, in model coordinates
   * @param radius - the radius of the thing being dragged, in view coordinates
   */
  protected constrainDragPoint( point: Vector2, radius: number ): Vector2 {

    const dragBoundsItems = this.getDragBoundsItems();

    if ( !_.every( [ this.dragDebugPath, ...dragBoundsItems.map( item => item.node ) ] ) ) {
      return point;
    }

    const modelViewTransform = this.modelViewTransformProperty.value;
    const interfaceBounds = this.interfaceBoundsProperty.value;

    let shape = Shape.bounds( modelViewTransform.viewToModelBounds( interfaceBounds.eroded( radius ) ) );

    dragBoundsItems.forEach( item => {
      if ( item.node.visible ) {
        let viewBounds = this.boundsOf( item.node );
        if ( viewBounds.isValid() ) {

          if ( item.expandX === 'left' ) {
            viewBounds = viewBounds.withMinX( interfaceBounds.minX ); // expand to left
          }
          else if ( item.expandX === 'right' ) {
            viewBounds = viewBounds.withMaxX( interfaceBounds.maxX ); // expand to right
          }

          if ( item.expandY === 'top' ) {
            viewBounds = viewBounds.withMinY( interfaceBounds.minY ); // expand to top
          }
          else if ( item.expandY === 'bottom' ) {
            viewBounds = viewBounds.withMaxY( interfaceBounds.maxY ); // expand to bottom
          }

          const modelBounds = modelViewTransform.viewToModelBounds( viewBounds.dilated( radius ) );

          shape = shape.shapeDifference( Shape.bounds( modelBounds ) );
        }
      }
    } );

    // Update dragDebugPath if running with &dev
    if ( phet.chipper.queryParameters.dev ) {
      this.dragDebugPath.shape = modelViewTransform.modelToViewShape( shape );
    }

    if ( shape.containsPoint( point ) || shape.getArea() === 0 ) {
      return point;
    }
    else {
      return shape.getClosestPoint( point );
    }
  }
}

solarSystemCommon.register( 'SolarSystemCommonScreenView', SolarSystemCommonScreenView );