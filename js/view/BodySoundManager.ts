// Copyright 2023, University of Colorado Boulder

/**
 * Module in charge of controlling the sounds of the bodies in the simulation.
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import SolarSystemCommonModel from '../model/SolarSystemCommonModel.js';
import SoundClip from '../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../tambo/js/soundManager.js';
import Bodies_Collide_Absorb_2_to_1_mp3 from '../../sounds/Bodies_Collide_Absorb_2_to_1_mp3.js';
import Bodies_Collide_Absorb_3_to_2_mp3 from '../../sounds/Bodies_Collide_Absorb_3_to_2_mp3.js';
import Bodies_Collide_Absorb_4_to_3_mp3 from '../../sounds/Bodies_Collide_Absorb_4_to_3_mp3.js';
import Collision_Sound_mp3 from '../../sounds/Collision_Sound_mp3.js';
import Mass_Selection_1_mp3 from '../../sounds/Mass_Selection_1_mp3.js';
import Mass_Selection_2_mp3 from '../../sounds/Mass_Selection_2_mp3.js';
import Mass_Selection_3_mp3 from '../../sounds/Mass_Selection_3_mp3.js';
import Mass_Selection_4_mp3 from '../../sounds/Mass_Selection_4_mp3.js';
import solarSystemCommon from '../solarSystemCommon.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';

const bodyNumberSounds = [
  Mass_Selection_1_mp3,
  Mass_Selection_2_mp3,
  Mass_Selection_3_mp3,
  Mass_Selection_4_mp3
];

// Sounds for when the bodies are reduced from the number control or collision
const removalSounds = [
  Bodies_Collide_Absorb_2_to_1_mp3,
  Bodies_Collide_Absorb_3_to_2_mp3,
  Bodies_Collide_Absorb_4_to_3_mp3,
  Collision_Sound_mp3
];

export default class BodySoundManager {

  private readonly model: SolarSystemCommonModel;

  // Sounds for the number of bodies spinner
  private readonly bodyNumberSoundClips: SoundClip[];

  // Sounds for the removal of bodies (different for every resulting number of bodies after each removal)
  private readonly removalSoundClips: SoundClip[];

  public constructor( model: SolarSystemCommonModel ) {
    this.model = model;

    this.bodyNumberSoundClips = bodyNumberSounds.map( sound => new SoundClip( sound, {
      initialOutputLevel: SolarSystemCommonConstants.DEFAULT_SOUND_OUTPUT_LEVEL
    } ) );

    this.removalSoundClips = removalSounds.map( sound => new SoundClip( sound, {
      initialOutputLevel: SolarSystemCommonConstants.DEFAULT_SOUND_OUTPUT_LEVEL
    } ) );

    this.bodyNumberSoundClips.forEach( sound => soundManager.addSoundGenerator( sound ) );
    this.removalSoundClips.forEach( sound => soundManager.addSoundGenerator( sound ) );

    // Increasing the level of the collision sound
    this.removalSoundClips[ this.removalSoundClips.length - 1 ].setOutputLevel( 10 );
  }

  public playBodyAddedSound( bodyNumber: number ): void {
    const soundClip = this.bodyNumberSoundClips[ bodyNumber ];
    assert && assert( soundClip, `No soundClip found for bodyNumber ${bodyNumber}` );
    soundClip.play();
  }

  public playBodyRemovedSound( bodyNumber: number ): void {
    const soundClip = this.removalSoundClips[ bodyNumber ];
    assert && assert( soundClip, `No soundClip found for bodyNumber ${bodyNumber}` );
    soundClip.play();
  }
}


solarSystemCommon.register( 'BodySoundManager', BodySoundManager );