import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class VideoCallService {
  private socket: WebSocket | null = null;
  public peerConnection: RTCPeerConnection | null = null;
  
  public remoteStream$ = new Subject<MediaStream>();
  public localStream$ = new Subject<MediaStream>();
  public peerJoined$ = new Subject<{user: string, role: string}>();
  public peerLeft$ = new Subject<{user: string}>();

  private localStream: MediaStream | null = null;

  constructor(private auth: AuthService) {}

  async startLocalVideo(): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      this.localStream$.next(this.localStream);
      return this.localStream;
    } catch (err) {
      console.error('Failed to get local stream', err);
      throw err;
    }
  }

  connect(doctorId: number) {
    const token = this.auth.accessToken;
    if (!token) return;
    
    this.socket = new WebSocket(`ws://localhost:8000/ws/video/${doctorId}/?token=${token}`);

    this.socket.onopen = () => {
      this.socket?.send(JSON.stringify({ type: 'join' }));
    };

    this.socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'peer_joined') {
        this.peerJoined$.next({user: data.user, role: data.role});
        // We can wait for the other peer to be ready before offering
      } else if (data.type === 'peer_left' || data.type === 'peer_disconnected') {
        this.peerLeft$.next({user: data.user});
      } else if (data.type === 'offer') {
        await this.handleOffer(data.data);
      } else if (data.type === 'answer') {
        await this.handleAnswer(data.data);
      } else if (data.type === 'ice_candidate') {
        await this.handleIceCandidate(data.data);
      }
    };
  }

  private initPeerConnection() {
    if (this.peerConnection) return;

    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });
    }

    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream$.next(event.streams[0]);
      }
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
          type: 'ice_candidate',
          data: event.candidate
        }));
      }
    };
  }

  async createOffer() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.initPeerConnection();
    const offer = await this.peerConnection!.createOffer();
    await this.peerConnection!.setLocalDescription(offer);
    this.socket.send(JSON.stringify({
      type: 'offer',
      data: offer
    }));
  }

  async handleOffer(offer: RTCSessionDescriptionInit) {
    this.initPeerConnection();
    await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection!.createAnswer();
    await this.peerConnection!.setLocalDescription(answer);
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'answer',
        data: answer
      }));
    }
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
    if (this.socket) {
      this.socket.send(JSON.stringify({ type: 'leave' }));
      this.socket.close();
      this.socket = null;
    }
  }
}
