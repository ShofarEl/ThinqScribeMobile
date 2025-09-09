// WebRTC Polyfill for React Native
// This provides basic WebRTC functionality for mobile devices

import { Platform } from 'react-native';

// Mock WebRTC classes for React Native
class MockRTCIceCandidate {
  constructor(candidateInitDict) {
    this.candidate = candidateInitDict.candidate;
    this.sdpMLineIndex = candidateInitDict.sdpMLineIndex;
    this.sdpMid = candidateInitDict.sdpMid;
  }
}

class MockRTCSessionDescription {
  constructor(descriptionInitDict) {
    this.type = descriptionInitDict.type;
    this.sdp = descriptionInitDict.sdp;
  }
}

class MockMediaStream {
  constructor() {
    this.id = `stream_${Date.now()}`;
    this.active = true;
    this._tracks = [];
  }

  getTracks() {
    return this._tracks;
  }

  getAudioTracks() {
    return this._tracks.filter(track => track.kind === 'audio');
  }

  getVideoTracks() {
    return this._tracks.filter(track => track.kind === 'video');
  }

  addTrack(track) {
    this._tracks.push(track);
  }

  removeTrack(track) {
    const index = this._tracks.indexOf(track);
    if (index > -1) {
      this._tracks.splice(index, 1);
    }
  }
}

class MockMediaStreamTrack {
  constructor(kind, id) {
    this.kind = kind;
    this.id = id || `track_${Date.now()}`;
    this.label = `${kind} track`;
    this.enabled = true;
    this.muted = false;
    this.readyState = 'live';
  }

  stop() {
    this.readyState = 'ended';
    this.enabled = false;
  }

  addEventListener(event, handler) {
    // Mock event listener
  }

  removeEventListener(event, handler) {
    // Mock event listener removal
  }
}

class MockRTCPeerConnection {
  constructor(configuration) {
    this.configuration = configuration;
    this.localDescription = null;
    this.remoteDescription = null;
    this.connectionState = 'new';
    this.iceConnectionState = 'new';
    this.signalingState = 'stable';
    this._eventListeners = {};
    this._iceCandidates = [];
  }

  async createOffer(options = {}) {
    return new MockRTCSessionDescription({
      type: 'offer',
      sdp: `v=0\r\no=- ${Date.now()} 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=msid-semantic: WMS\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:${Math.random().toString(36).substr(2, 8)}\r\na=ice-pwd:${Math.random().toString(36).substr(2, 22)}\r\na=ice-options:trickle\r\na=fingerprint:sha-256 ${Math.random().toString(36).substr(2, 64)}\r\na=setup:actpass\r\na=mid:0\r\na=sendrecv\r\na=rtcp-mux\r\na=rtpmap:111 opus/48000/2\r\na=rtcp-fb:111 transport-cc\r\na=fmtp:111 minptime=10;useinbandfec=1\r\na=ssrc:${Math.floor(Math.random() * 1000000000)} cname:${Math.random().toString(36).substr(2, 8)}\r\n`
    });
  }

  async createAnswer(options = {}) {
    return new MockRTCSessionDescription({
      type: 'answer',
      sdp: `v=0\r\no=- ${Date.now()} 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=msid-semantic: WMS\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:${Math.random().toString(36).substr(2, 8)}\r\na=ice-pwd:${Math.random().toString(36).substr(2, 22)}\r\na=ice-options:trickle\r\na=fingerprint:sha-256 ${Math.random().toString(36).substr(2, 64)}\r\na=setup:active\r\na=mid:0\r\na=sendrecv\r\na=rtcp-mux\r\na=rtpmap:111 opus/48000/2\r\na=rtcp-fb:111 transport-cc\r\na=fmtp:111 minptime=10;useinbandfec=1\r\na=ssrc:${Math.floor(Math.random() * 1000000000)} cname:${Math.random().toString(36).substr(2, 8)}\r\n`
    });
  }

  async setLocalDescription(description) {
    this.localDescription = description;
    this.signalingState = 'have-local-offer';
    
    // Simulate ICE gathering
    setTimeout(() => {
      if (this.onicecandidate) {
        this.onicecandidate({
          candidate: new MockRTCIceCandidate({
            candidate: `candidate:1 1 UDP 2113667326 192.168.1.100 54400 typ host generation 0`,
            sdpMLineIndex: 0,
            sdpMid: '0'
          })
        });
      }
    }, 100);
  }

  async setRemoteDescription(description) {
    this.remoteDescription = description;
    this.signalingState = 'have-remote-offer';
    
    // Simulate connection
    setTimeout(() => {
      this.connectionState = 'connected';
      this.iceConnectionState = 'connected';
      
      if (this.onconnectionstatechange) {
        this.onconnectionstatechange();
      }
      
      if (this.oniceconnectionstatechange) {
        this.oniceconnectionstatechange();
      }
    }, 1000);
  }

  async addIceCandidate(candidate) {
    this._iceCandidates.push(candidate);
  }

  addTrack(track, stream) {
    // Mock adding track
    return Math.floor(Math.random() * 1000000000);
  }

  removeTrack(sender) {
    // Mock removing track
  }

  close() {
    this.connectionState = 'closed';
    this.iceConnectionState = 'closed';
    this.signalingState = 'closed';
  }

  // Event listener methods
  addEventListener(event, handler) {
    if (!this._eventListeners[event]) {
      this._eventListeners[event] = [];
    }
    this._eventListeners[event].push(handler);
  }

  removeEventListener(event, handler) {
    if (this._eventListeners[event]) {
      const index = this._eventListeners[event].indexOf(handler);
      if (index > -1) {
        this._eventListeners[event].splice(index, 1);
      }
    }
  }

  // Event properties for compatibility
  set onicecandidate(handler) {
    this._onicecandidate = handler;
  }

  get onicecandidate() {
    return this._onicecandidate;
  }

  set ontrack(handler) {
    this._ontrack = handler;
  }

  get ontrack() {
    return this._ontrack;
  }

  set onconnectionstatechange(handler) {
    this._onconnectionstatechange = handler;
  }

  get onconnectionstatechange() {
    return this._onconnectionstatechange;
  }

  set oniceconnectionstatechange(handler) {
    this._oniceconnectionstatechange = handler;
  }

  get oniceconnectionstatechange() {
    return this._oniceconnectionstatechange;
  }

  set onnegotiationneeded(handler) {
    this._onnegotiationneeded = handler;
  }

  get onnegotiationneeded() {
    return this._onnegotiationneeded;
  }
}

// Mock navigator.mediaDevices
const mockMediaDevices = {
  getUserMedia: async (constraints) => {
    console.log('🎤 Mock getUserMedia called with constraints:', constraints);
    
    const stream = new MockMediaStream();
    
    if (constraints.audio) {
      const audioTrack = new MockMediaStreamTrack('audio');
      stream.addTrack(audioTrack);
    }
    
    if (constraints.video) {
      const videoTrack = new MockMediaStreamTrack('video');
      stream.addTrack(videoTrack);
    }
    
    return stream;
  }
};

// Install polyfills if WebRTC is not available
export const installWebRTCPolyfill = () => {
  if (Platform.OS !== 'web' && typeof global.RTCPeerConnection === 'undefined') {
    console.log('🔧 Installing WebRTC polyfill for React Native');
    
    global.RTCPeerConnection = MockRTCPeerConnection;
    global.RTCIceCandidate = MockRTCIceCandidate;
    global.RTCSessionDescription = MockRTCSessionDescription;
    global.MediaStream = MockMediaStream;
    global.MediaStreamTrack = MockMediaStreamTrack;
    
    if (typeof global.navigator === 'undefined') {
      global.navigator = {};
    }
    
    if (typeof global.navigator.mediaDevices === 'undefined') {
      global.navigator.mediaDevices = mockMediaDevices;
    }
    
    console.log('✅ WebRTC polyfill installed successfully');
  }
};

export default {
  installWebRTCPolyfill,
  MockRTCPeerConnection,
  MockRTCIceCandidate,
  MockRTCSessionDescription,
  MockMediaStream,
  MockMediaStreamTrack
};
