// Copyright 2023, University of Colorado Boulder
/**
 * GridNode used in My Solar System and Kepler's Laws,
 * it supports the option of adding bolder axes lines.
 *
 * @author Agustín Vallejo
 */

import solarSystemCommon from '../solarSystemCommon.js';
import GridNode, { GridNodeOptions } from '../../../scenery-phet/js/GridNode.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import { Node, NodeOptions, Path, PathOptions } from '../../../scenery/js/imports.js';
import optionize from '../../../phet-core/js/optionize.js';
import Vector2 from '../../../dot/js/Vector2.js';
import SolarSystemCommonColors from '../SolarSystemCommonColors.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import { Shape } from '../../../kite/js/imports.js';

type SelfOptions = {
  boldOriginAxes?: boolean; // Adds a thicker grid line at the origin x=0 and y=0
  gridNodeOptions?: GridNodeOptions;
  originAxesNodeOptions?: PathOptions;
};

type SolarSystemCommonGridNodeOptions = SelfOptions & PickRequired<NodeOptions, 'tandem' | 'visibleProperty'>;

export default class SolarSystemCommonGridNode extends Node {

  public constructor(
    transformProperty: TReadOnlyProperty<ModelViewTransform2>,
    spacing: number,
    center: Vector2,
    numGridLines: number,
    providedOptions?: SolarSystemCommonGridNodeOptions ) {

    const options = optionize<SolarSystemCommonGridNodeOptions, SelfOptions, NodeOptions>()( {
      // SelfOptions
      boldOriginAxes: false,

      // GridNodeOptions
      gridNodeOptions: {
        stroke: SolarSystemCommonColors.gridIconStrokeColorProperty
      },

      // OriginAxesNodeOptions
      originAxesNodeOptions: {
        lineWidth: 2,
        stroke: 'gray'
      }
    }, providedOptions );

    const gridNode = new GridNode(
      transformProperty,
      spacing,
      center,
      100,
      options.gridNodeOptions
    );

    if ( options.boldOriginAxes ) {
      const originAxesNode = new Path( null, options.originAxesNodeOptions );
      transformProperty.link( ( transform: ModelViewTransform2 ) => {
        const shape = new Shape();

        const axisLength = numGridLines * spacing;
        shape.moveTo( center.x - axisLength, center.y ).lineTo( center.x + axisLength, center.y ); // horizontal line
        shape.moveTo( center.x, center.y - axisLength ).lineTo( center.x, center.y + axisLength ); // vertical line

        originAxesNode.shape = transform.modelToViewShape( shape );
      } );

      options.children = [ gridNode, originAxesNode ];
    }
    else {
      options.children = [ gridNode ];
    }

    super( options );
  }
}

solarSystemCommon.register( 'SolarSystemCommonGridNode', SolarSystemCommonGridNode );