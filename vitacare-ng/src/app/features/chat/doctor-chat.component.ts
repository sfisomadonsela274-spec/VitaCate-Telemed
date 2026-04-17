import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService, ChatMessage, TypingStatus } from '../../core/services/chat.service';
import { VideoCallService } from '../../core/services/video-call.service';
import { ApiService } from '../../core/services/api.service';
import { Subscription, timer } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { PremiumCardComponent } from '../../shared/components/premium-card.component';
import { InputFieldComponent } from '../../shared/components/input-field.component';
import { VideoCallDialogComponent } from '../../shared/components/video-call-dialog.component';

@Component({
  selector: 'app-doctor-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, PremiumCardComponent, InputFieldComponent, VideoCallDialogComponent],
  template: `
    <div class="chat-page">
      <div class="side-nav">
          <button class="back-link" (click)="navigate('/doctor-home')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span>Back</span>
          </button>
          
          <div class="panel-header">
            <h1>Active Consultations</h1>
            <div class="badge">{{ uniquePatients.length }}</div>
          </div>

          <div class="contact-list custom-scroll">
            <div *ngFor="let pat of uniquePatients" 
                 class="contact-item" 
                 [class.active]="selectedPatient?.id === pat.id"
                 (click)="selectPatient(pat)">
              <div class="avatar pat">{{ pat.name?.[0] || 'P' }}</div>
              <div class="contact-info">
                <div class="top">
                   <span class="name">{{ pat.name }}</span>
                   <span class="time">Bedside</span>
                </div>
                <p class="preview">Click to open chart</p>
              </div>
            </div>
          </div>
      </div>

      <main class="chat-main" [class.mobile-hidden]="!selectedPatient">
        <header class="chat-header" *ngIf="selectedPatient">
           <button class="mob-back" (click)="clearSelection()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
           </button>
           <div class="header-avatar">{{ selectedPatient.name?.[0] }}</div>
            <div class="header-info">
               <h2>{{ selectedPatient.name }} (Room 402)</h2>
               <div class="connection-pill" [class]="chatStatus$ | async">
                  <span class="dot"></span>
                  <span class="status-text">{{ (chatStatus$ | async) === 'open' ? 'Live' : (chatStatus$ | async) }}</span>
               </div>
            </div>
           
           <div class="header-actions">
              <button class="action-btn" (click)="startVideoCall()" title="Video Consultation">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
              </button>
           </div>
        </header>

        <div class="chat-messages custom-scroll" #scrollContainer *ngIf="selectedPatient">
           <div *ngFor="let msg of filteredMessages" class="msg-row" [class.me]="isSentByMe(msg)">
              <div class="bubble-avatar" *ngIf="!isSentByMe(msg)">{{ selectedPatient.name?.[0] }}</div>
              
              <div class="msg-bubble">
                 <span *ngIf="msg.message">{{ msg.message }}</span>
                 <img *ngIf="msg.message_type === 'image'" [src]="msg.media_payload" class="msg-img" />
                 
                 <div class="msg-meta">
                    <span class="msg-time">{{ msg.timestamp | date:'shortTime' }}</span>
                    <div class="read-status" *ngIf="isSentByMe(msg)">
                       <svg *ngIf="msg.is_read" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="read"><path d="M2 12l5 5L22 4M7 12l5 5L22 4"/></svg>
                       <svg *ngIf="!msg.is_read" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="sent"><path d="M20 6L9 17l-5-5"/></svg>
                    </div>
                 </div>
              </div>
           </div>

           <!-- Typing Indicator -->
           <div class="typing-indicator" *ngIf="isPeerTyping">
              <div class="dot-bounce"></div><div class="dot-bounce"></div><div class="dot-bounce"></div>
              <span>Patient is typing...</span>
           </div>
        </div>

        <div class="chat-input-row" *ngIf="selectedPatient">
            <div class="input-wrapper">
               <button class="attach-btn" (click)="fileInput.click()">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  <input #fileInput type="file" hidden (change)="onFileSelected($event)" accept="image/*" />
               </button>
               <input type="text" [(ngModel)]="newMessage" (input)="onTyping()" (keyup.enter)="sendMessage()" placeholder="Professional message..." />
               <button class="send-button" (click)="sendMessage()" [disabled]="!newMessage.trim() && !selectedPatient">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
               </button>
            </div>
        </div>

        <div class="no-chat-state" *ngIf="!selectedPatient">
           <div class="illu">🩺</div>
           <h2>Physician Portal</h2>
           <p>Pick a patient record to start a secure clinical consultation.</p>
        </div>
      </main>

      <!-- Video Call Overlay -->
      <app-video-call-dialog [active]="isVideoActive" (closed)="isVideoActive = false"></app-video-call-dialog>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; overflow: hidden; --sidebar-w: 380px; }
    .chat-page { display: flex; height: 100%; background: #fff; }
    .side-nav { width: var(--sidebar-w); border-right: 1px solid var(--divider); display: flex; flex-direction: column; background: #fff; }
    .back-link { display: flex; align-items: center; gap: 8px; padding: 20px 24px; color: var(--text-muted); font-weight: 600; font-size: 0.9rem; }
    .panel-header { padding: 0 24px 16px; display: flex; align-items: center; gap: 12px; h1 { font-size: 1.5rem; margin: 0; color: var(--text-dark); } .badge { background: var(--secondary-color); color: white; padding: 2px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; } }
    .contact-list { flex: 1; overflow-y: auto; }
    .contact-item { display: flex; align-items: center; gap: 14px; padding: 14px 24px; cursor: pointer; transition: background 0.2s; }
    .contact-item.active { background: #f2f6f9; }
    .avatar { width: 54px; height: 54px; border-radius: 50%; background: var(--secondary-color); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
    .contact-info { flex: 1; min-width: 0; .top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; } .name { font-weight: 600; color: var(--text-dark); font-size: 0.95rem; } .preview { font-size: 0.82rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } }
    .chat-main { flex: 1; display: flex; flex-direction: column; background: #fff; position: relative; }
    .chat-header { padding: 16px 30px; border-bottom: 1px solid var(--divider); display: flex; align-items: center; gap: 16px; background: rgba(255,255,255,0.8); position: sticky; top: 0; z-index: 10; }
    .header-info { flex: 1; h2 { font-size: 1.05rem; margin: 0; color: var(--text-dark); } }
    .connection-pill { display: inline-flex; align-items: center; gap: 6px; font-size: 0.7rem; font-weight: 600; padding: 2px 8px; border-radius: 10px; margin-top: 2px; &.open { color: var(--primary-color); background: var(--primary-pale); .dot { background: var(--primary-color); box-shadow: 0 0 8px var(--primary-color); } } }
    .action-btn { width: 40px; height: 40px; border-radius: 50%; background: var(--primary-pale); color: var(--primary-color); display: flex; align-items: center; justify-content: center; }
    .chat-messages { flex: 1; overflow-y: auto; padding: 30px; display: flex; flex-direction: column; gap: 8px; background: #fafaf9; }
    .msg-row { display: flex; align-items: flex-end; gap: 10px; margin-bottom: 4px; }
    .msg-row.me { flex-direction: row-reverse; }
    .msg-bubble { max-width: 70%; padding: 12px 16px; border-radius: 20px 20px 20px 4px; background: white; border: 1px solid #f0f0f0; }
    .me .msg-bubble { background: var(--secondary-color); color: white; border-radius: 20px 20px 4px 20px; border: none; }
    .msg-img { max-width: 100%; border-radius: 12px; margin-bottom: 8px; display: block; }
    .msg-meta { display: flex; align-items: center; justify-content: flex-end; gap: 4px; margin-top: 4px; font-size: 0.62rem; }
    .typing-indicator { display: flex; align-items: center; gap: 4px; padding: 10px 20px; font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }
    .dot-bounce { width: 4px; height: 4px; border-radius: 50%; background: #94a3b8; animation: bounce 1.4s infinite ease-in-out; }
    .dot-bounce:nth-child(2) { animation-delay: 0.2s; } .dot-bounce:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
    .chat-input-row { padding: 10px 24px 30px; background: white; border-top: 1px solid var(--divider); }
    .input-wrapper { background: #f8fafc; border: 1.5px solid #edf2f7; border-radius: 30px; display: flex; align-items: center; padding: 6px; input { flex: 1; background: none; border: none; outline: none; padding: 12px 14px; font-size: 1rem; } }
    .attach-btn { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); background: none; border: none; }
    .send-button { width: 44px; height: 44px; border-radius: 50%; background: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; }
  `]
})
export class DoctorChatComponent implements OnInit, OnDestroy {
  uniquePatients: any[] = [];
  selectedPatient: any = null;
  allMessages: ChatMessage[] = [];
  newMessage = '';
  chatStatus$; 
  isPeerTyping = false;
  isVideoActive = false;
  myUserId: number | null = null;
  
  private subs = new Subscription();
  private typingTimerSub?: Subscription;

  constructor(
    private router: Router, 
    private chatService: ChatService,
    private videoService: VideoCallService,
    private apiService: ApiService,
    private auth: AuthService
  ) {
     this.chatStatus$ = this.chatService.status$;
  }

  ngOnInit() {
    this.apiService.getPatients().subscribe(data => this.uniquePatients = data);
    this.auth.currentUser$.subscribe(() => {
       const uid = this.auth.userId;
       if (uid) {
         this.myUserId = uid;
         this.chatService.connect(uid);
       }
    });

    this.subs.add(this.chatService.history$.subscribe(msgs => {
      this.allMessages = msgs;
      this.scrollToBottom();
    }));

    this.subs.add(this.chatService.messages$.subscribe(msg => {
      if (!this.allMessages.find(m => m.id === msg.id)) {
        this.allMessages = [...this.allMessages, msg];
        this.scrollToBottom();
      }
    }));

    this.subs.add(this.chatService.typing$.subscribe((status: TypingStatus) => {
      if (this.selectedPatient && String(status.sender_id) === String(this.selectedPatient.id)) {
        this.isPeerTyping = status.is_typing;
        this.scrollToBottom();
      }
    }));
  }

  get filteredMessages(): ChatMessage[] {
    if (!this.selectedPatient) return [];
    const patId = String(this.selectedPatient.id);
    return this.allMessages.filter(m => 
      String(m.sender_id) === patId || String(m.receiver_id) === patId
    );
  }

  selectPatient(pat: any) {
    this.selectedPatient = pat;
    this.chatService.getHistory(pat.id);
    this.scrollToBottom();
  }

  clearSelection() { this.selectedPatient = null; }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedPatient) return;
    this.chatService.sendMessage(this.newMessage, this.selectedPatient.id);
    this.newMessage = '';
    this.sendTypingStatus(false);
    this.scrollToBottom();
  }

  onTyping() {
    this.sendTypingStatus(true);
    this.typingTimerSub?.unsubscribe();
    this.typingTimerSub = timer(3000).subscribe(() => this.sendTypingStatus(false));
  }

  sendTypingStatus(isTyping: boolean) {
    if (this.selectedPatient) {
      this.chatService.sendTypingStatus(isTyping, this.selectedPatient.id);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file || !this.selectedPatient) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.chatService.sendMessage('', this.selectedPatient.id, 'image', reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  startVideoCall() {
    if (!this.selectedPatient || !this.myUserId) return;
    this.videoService.connect(this.myUserId);
    this.videoService.startLocalVideo().then(() => {
      this.isVideoActive = true;
      this.videoService.createOffer();
    });
  }

  isSentByMe(msg: ChatMessage): boolean {
    const myId = this.auth.userId;
    return myId ? String(msg.sender_id) === String(myId) : false;
  }

  scrollToBottom() {
    setTimeout(() => {
      const c = document.querySelector('.chat-messages');
      if (c) c.scrollTop = c.scrollHeight;
    }, 100);
  }

  navigate(route: string) { this.router.navigate([route]); }

  ngOnDestroy() {
    this.chatService.disconnect();
    this.subs.unsubscribe();
    this.typingTimerSub?.unsubscribe();
  }
}
