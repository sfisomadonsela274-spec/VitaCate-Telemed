import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoCallService } from '../../core/services/video-call.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-video-call-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="video-overlay" [class.active]="active">
      <div class="video-container">
        <!-- Main Remote Feed -->
        <video #remoteVideo autoplay playsinline class="remote-video"></video>
        
        <!-- local Picture-in-Picture -->
        <div class="local-pip">
          <video #localVideo autoplay playsinline muted></video>
        </div>

        <!-- Overlays -->
        <div class="video-meta">
          <div class="call-info">
             <h2>Live Consultation</h2>
             <span class="status-indicator">
                <span class="dot pulse"></span> Secure Connection
             </span>
          </div>
        </div>

        <!-- Controls Bar -->
        <div class="controls-bar">
          <button class="ctrl-btn" [class.muted]="isMuted" (click)="toggleMute()">
            <svg *ngIf="!isMuted" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5c2.21 0 4 1.79 4 4v6c0 2.21-1.79 4-4 4M7 5C4.79 5 3 6.79 3 9v6c0 2.21 1.79 4 4 4M2 11h20"/></svg>
            <svg *ngIf="isMuted" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/></svg>
          </button>
          
          <button class="ctrl-btn end-call" (click)="endCall()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.14c-.1.05-.21.08-.32.08-.11 0-.22-.03-.32-.08l-7.9-4.14A1.003 1.003 0 0 1 3 16.5v-9c0-.38.21-.71.53-.88l7.9-4.14c.2-.1.44-.1.64 0l7.9 4.14c.32.17.53.5.53.88v9z"/></svg>
          </button>
          
          <button class="ctrl-btn" [class.video-off]="!videoEnabled" (click)="toggleVideo()">
            <svg *ngIf="videoEnabled" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            <svg *ngIf="!videoEnabled" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16 16v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10l-2.43-1.74"/></svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .video-overlay {
      position: fixed; inset: 0; z-index: 9999;
      background: var(--secondary-dark);
      display: none; align-items: center; justify-content: center;
      padding: 40px;
    }
    .video-overlay.active { display: flex; animation: fadeIn 0.4s ease; }
    
    .video-container {
      width: 100%; max-width: 1100px; height: 100%; max-height: 800px;
      position: relative; border-radius: 32px; overflow: hidden;
      background: #000; box-shadow: var(--shadow-premium);
    }
    
    .remote-video { width: 100%; height: 100%; object-fit: cover; background: #1a1a1a; }
    
    .local-pip {
      position: absolute; top: 30px; right: 30px;
      width: 200px; height: 150px; border-radius: 20px;
      overflow: hidden; border: 3px solid rgba(255,255,255,0.2);
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      z-index: 10; background: #000;
      video { width: 100%; height: 100%; object-fit: cover; }
    }
    
    .video-meta {
      position: absolute; top: 0; left: 0; right: 0;
      padding: 40px; background: linear-gradient(to bottom, rgba(0,0,0,0.6), transparent);
      color: white;
      h2 { margin: 0 0 4px; font-size: 1.4rem; font-weight: 700; letter-spacing: -0.02em; }
      .status-indicator { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 600; opacity: 0.8; }
    }
    
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; }
    .pulse { animation: pulseGlow 2s infinite; }
    
    .controls-bar {
      position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 20px;
      padding: 16px 32px; background: rgba(255,255,255,0.1);
      backdrop-filter: blur(20px); border-radius: 99px;
      border: 1px solid rgba(255,255,255,0.2);
    }
    
    .ctrl-btn {
      width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.1); border: none; color: white; cursor: pointer; transition: all 0.2s;
    }
    .ctrl-btn:hover { background: rgba(255,255,255,0.2); transform: translateY(-2px); }
    .ctrl-btn.end-call { background: var(--error); }
    .ctrl-btn.end-call:hover { background: #b32424; transform: scale(1.1); }
    .ctrl-btn.muted, .ctrl-btn.video-off { background: rgba(255,255,255,0.4); color: #000; }
    
    @keyframes fadeIn { from { opacity: 0; transform: scale(1.05); } to { opacity: 1; transform: scale(1); } }
    @keyframes pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }
  `]
})
export class VideoCallDialogComponent implements OnInit, OnDestroy {
  @Input() active = false;
  @Output() closed = new EventEmitter<void>();

  isMuted = false;
  videoEnabled = true;
  private subs = new Subscription();

  constructor(public videoService: VideoCallService) {}

  ngOnInit() {
    this.subs.add(this.videoService.localStream$.subscribe(stream => {
      const v = document.querySelector('.local-pip video') as HTMLVideoElement;
      if (v) v.srcObject = stream;
    }));
    
    this.subs.add(this.videoService.remoteStream$.subscribe(stream => {
      const v = document.querySelector('.remote-video') as HTMLVideoElement;
      if (v) v.srcObject = stream;
    }));
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.videoService.peerConnection?.getSenders().forEach(sender => {
      if (sender.track?.kind === 'audio') sender.track.enabled = !this.isMuted;
    });
  }

  toggleVideo() {
    this.videoEnabled = !this.videoEnabled;
    this.videoService.peerConnection?.getSenders().forEach(sender => {
      if (sender.track?.kind === 'video') sender.track.enabled = this.videoEnabled;
    });
  }

  endCall() {
    this.videoService.disconnect();
    this.closed.emit();
  }

  ngOnDestroy() { this.subs.unsubscribe(); }
}
