/* eslint-disable */
/* @formatter:off */

import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,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qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpMQU1FMy45OS41qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
const soundByteArray = base64SoundToByteArray( phetAudioContext, soundURI );
const unlock = asyncLoader.createLock( soundURI );
const wrappedAudioBuffer = new WrappedAudioBuffer();

// safe way to unlock
let unlocked = false;
const safeUnlock = () => {
  if ( !unlocked ) {
    unlock();
    unlocked = true;
  }
};

const onDecodeSuccess = decodedAudio => {
  if ( wrappedAudioBuffer.audioBufferProperty.value === null ) {
    wrappedAudioBuffer.audioBufferProperty.set( decodedAudio );
    safeUnlock();
  }
};
const onDecodeError = decodeError => {
  console.warn( 'decode of audio data failed, using stubbed sound, error: ' + decodeError );
  wrappedAudioBuffer.audioBufferProperty.set( phetAudioContext.createBuffer( 1, 1, phetAudioContext.sampleRate ) );
  safeUnlock();
};
const decodePromise = phetAudioContext.decodeAudioData( soundByteArray.buffer, onDecodeSuccess, onDecodeError );
if ( decodePromise ) {
  decodePromise
    .then( decodedAudio => {
      if ( wrappedAudioBuffer.audioBufferProperty.value === null ) {
        wrappedAudioBuffer.audioBufferProperty.set( decodedAudio );
        safeUnlock();
      }
    } )
    .catch( e => {
      console.warn( 'promise rejection caught for audio decode, error = ' + e );
      safeUnlock();
    } );
}
export default wrappedAudioBuffer;