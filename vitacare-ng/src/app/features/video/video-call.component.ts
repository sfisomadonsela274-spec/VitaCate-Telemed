import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoCallService } from '../../core/services/video-call.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="video-container">
      <!-- Full screen remote video background -->
      <video #remoteVideo autoplay playsinline class="remote-video"></video>
      
      <!-- Top banner -->
      <div class="video-header">
        <div class="header-left">
          <div class="recording-dot"></div>
          <span>Secure Connection</span>
        </div>
        <div class="header-right">
          <span class="timer">{{ callDuration }}</span>
        </div>
      </div>
      
      <!-- Overlay text if waiting -->
      <div class="waiting-overlay" *ngIf="!peerConnected">
        <div class="pulse-ring"></div>
        <p>Waiting for {{ isDoctorRoom ? 'Patient' : 'Doctor' }} to join...</p>
      </div>

      <!-- PiP Local Video -->
      <div class="local-video-container">
        <video #localVideo autoplay playsinline muted class="local-video"></video>
      </div>

      <!-- Controls -->
      <div class="controls-bar">
        <button class="control-btn" [class.danger]="isMicMuted" (click)="toggleAudio()">
          <svg *ngIf="!isMicMuted" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          <svg *ngIf="isMicMuted" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/></svg>
        </button>

        <button class="control-btn hangup" (click)="endCall()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 2.59 3.4z"/></svg>
        </button>

        <button class="control-btn" [class.danger]="isVideoMuted" (click)="toggleVideo()">
          <svg *ngIf="!isVideoMuted" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          <svg *ngIf="isVideoMuted" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .video-container {
      width: 100vw; height: 100vh;
      background: #1a1a1a; position: relative;
      overflow: hidden; font-family: 'Inter', sans-serif;
    }
    .remote-video {
      width: 100%; height: 100%;
      object-fit: cover;
      background: #111;
    }
    .video-header {
      position: absolute; top: 0; left: 0; right: 0;
      padding: 24px;
      display: flex; justify-content: space-between; align-items: center;
      background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%);
      color: white; z-index: 10;
    }
    .header-left { display: flex; align-items: center; gap: 8px; font-weight: 500; font-size: 0.9rem; }
    .recording-dot { width: 8px; height: 8px; background: #ff4757; border-radius: 50%; box-shadow: 0 0 8px #ff4757; }
    .timer { background: rgba(0,0,0,0.4); padding: 4px 12px; border-radius: 12px; font-variant-numeric: tabular-nums; }
    
    .waiting-overlay {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 5; color: white;
    }
    .pulse-ring {
      width: 64px; height: 64px; border-radius: 50%;
      border: 3px solid rgba(255,255,255,0.8);
      border-top-color: var(--primary-color, #3d5a72);
      animation: spin 1s infinite linear;
      margin-bottom: 24px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    .local-video-container {
      position: absolute; bottom: 100px; right: 24px;
      width: 120px; height: 160px;
      background: #000; border-radius: 16px;
      overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      border: 2px solid rgba(255,255,255,0.2);
      z-index: 10;
    }
    .local-video { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
    
    .controls-bar {
      position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
      display: flex; gap: 20px;
      background: rgba(0,0,0,0.5); backdrop-filter: blur(10px);
      padding: 12px 24px; border-radius: 40px;
      z-index: 10;
    }
    .control-btn {
      width: 52px; height: 52px; border-radius: 50%;
      background: rgba(255,255,255,0.15); border: none;
      color: white; display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .control-btn:hover { background: rgba(255,255,255,0.25); transform: translateY(-4px); }
    .control-btn.danger { background: rgba(255, 71, 87, 0.2); color: #ff4757; }
    .control-btn.hangup { background: #ff4757; }
    .control-btn.hangup:hover { background: #ff6b81; }
    .control-btn.hangup svg { transform: rotate(135deg); }
  `]
})
export class VideoCallComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('localVideo') localVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideoRef!: ElementRef<HTMLVideoElement>;

  peerConnected = false;
  isMicMuted = false;
  isVideoMuted = false;
  callDuration = '00:00';
  isDoctorRoom = false; // Doctor is always the room host
  
  private roomDoctorId!: number;
  private timerInt: any;
  private seconds = 0;
  private subs = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private videoService: VideoCallService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
       const idParam = params.get('id');
       if (idParam) {
          this.roomDoctorId = Number(idParam);
       }
    });

    const currUserStr = localStorage.getItem('vitacare_tokens');
    if (currUserStr) {
      try {
        const p = JSON.parse(currUserStr);
        this.isDoctorRoom = (p.role === 'doctor');
      } catch(e) {}
    }

    this.subs.add(this.videoService.localStream$.subscribe(stream => {
      if (this.localVideoRef?.nativeElement) {
        this.localVideoRef.nativeElement.srcObject = stream;
      }
    }));

    this.subs.add(this.videoService.remoteStream$.subscribe(stream => {
      if (this.remoteVideoRef?.nativeElement) {
        this.remoteVideoRef.nativeElement.srcObject = stream;
        this.peerConnected = true;
        this.startTimer();
      }
    }));

    this.subs.add(this.videoService.peerJoined$.subscribe(peer => {
      // Peer joined. Let's send an offer.
      this.videoService.createOffer();
      this.peerConnected = true;
      this.startTimer();
    }));

    this.subs.add(this.videoService.peerLeft$.subscribe(peer => {
      this.peerConnected = false;
      if (this.remoteVideoRef?.nativeElement) {
        this.remoteVideoRef.nativeElement.srcObject = null;
      }
      this.stopTimer();
    }));
  }

  async ngAfterViewInit() {
    try {
      await this.videoService.startLocalVideo();
      if (this.roomDoctorId) {
        this.videoService.connect(this.roomDoctorId);
      }
    } catch (e) {
      console.error("Camera access denied or failed.");
      alert("Camera and Microphone access are required for Video calls.");
    }
  }

  toggleAudio() {
    this.isMicMuted = !this.isMicMuted;
    if (this.localVideoRef?.nativeElement?.srcObject) {
      const stream = this.localVideoRef.nativeElement.srcObject as MediaStream;
      stream.getAudioTracks().forEach(t => t.enabled = !this.isMicMuted);
    }
  }

  toggleVideo() {
    this.isVideoMuted = !this.isVideoMuted;
    if (this.localVideoRef?.nativeElement?.srcObject) {
      const stream = this.localVideoRef.nativeElement.srcObject as MediaStream;
      stream.getVideoTracks().forEach(t => t.enabled = !this.isVideoMuted);
    }
  }

  startTimer() {
    if (this.timerInt) clearInterval(this.timerInt);
    this.timerInt = setInterval(() => {
      this.seconds++;
      const m = Math.floor(this.seconds / 60);
      const s = this.seconds % 60;
      this.callDuration = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }, 1000);
  }

  stopTimer() {
    if (this.timerInt) clearInterval(this.timerInt);
  }

  endCall() {
    this.videoService.disconnect();
    // Go back depending on user role
    if (this.isDoctorRoom) {
      this.router.navigate(['/doctor-home']);
    } else {
      this.router.navigate(['/patient-home']);
    }
  }

  ngOnDestroy() {
    this.videoService.disconnect();
    this.stopTimer();
    this.subs.unsubscribe();
  }
}
