import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { supabase } from '../supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class VideoCallService {
  private channel: RealtimeChannel | null = null;
  public peerConnection: RTCPeerConnection | null = null;

  public remoteStream$ = new Subject<MediaStream>();
  public localStream$ = new Subject<MediaStream>();
  public peerJoined$ = new Subject<{ user: string; role: string }>();
  public peerLeft$ = new Subject<{ user: string }>();

  private localStream: MediaStream | null = null;

  async startLocalVideo(): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      this.localStream$.next(this.localStream);
      return this.localStream;
    } catch (err) {
      console.error('[VideoCallService] Failed to get local stream', err);
      throw err;
    }
  }

  connect(doctorId: string) {
    this.disconnect();

    this.channel = supabase.channel(`video_${doctorId}`, {
      config: { broadcast: { self: false } }
    });

    this.channel.on('broadcast', { event: 'peer_joined' }, (p) =>
      this.peerJoined$.next(p['payload'] as { user: string; role: string })
    );
    this.channel.on('broadcast', { event: 'peer_left' }, (p) =>
      this.peerLeft$.next(p['payload'] as { user: string })
    );
    this.channel.on('broadcast', { event: 'peer_disconnected' }, (p) =>
      this.peerLeft$.next(p['payload'] as { user: string })
    );
    this.channel.on('broadcast', { event: 'offer' }, (p) =>
      this.handleOffer(p['payload'].data)
    );
    this.channel.on('broadcast', { event: 'answer' }, (p) =>
      this.handleAnswer(p['payload'].data)
    );
    this.channel.on('broadcast', { event: 'ice_candidate' }, (p) =>
      this.handleIceCandidate(p['payload'].data)
    );

    this.channel.subscribe(() => {
      this.channel?.send({
        type: 'broadcast',
        event: 'join',
        payload: { user: localStorage.getItem('vitacare_user') ?? 'unknown' }
      });
    });
  }

  private initPeerConnection() {
    if (this.peerConnection) return;

    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    if (this.localStream) {
      this.localStream.getTracks().forEach(track =>
        this.peerConnection!.addTrack(track, this.localStream!)
      );
    }

    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream$.next(event.streams[0]);
      }
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.channel?.send({
          type: 'broadcast',
          event: 'ice_candidate',
          payload: { data: event.candidate }
        });
      }
    };
  }

  async createOffer() {
    this.initPeerConnection();
    const offer = await this.peerConnection!.createOffer();
    await this.peerConnection!.setLocalDescription(offer);
    this.channel?.send({
      type: 'broadcast',
      event: 'offer',
      payload: { data: offer }
    });
  }

  async handleOffer(offer: RTCSessionDescriptionInit) {
    this.initPeerConnection();
    await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection!.createAnswer();
    await this.peerConnection!.setLocalDescription(answer);
    this.channel?.send({
      type: 'broadcast',
      event: 'answer',
      payload: { data: answer }
    });
  }

  async handleAnswer(answer: RTCSessionDescriptionInit) {
    if (this.peerConnection) {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  async handleIceCandidate(candidate: RTCIceCandidateInit) {
    if (this.peerConnection) {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  disconnect() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    if (this.channel) {
      this.channel.send({ type: 'broadcast', event: 'leave', payload: {} });
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}
