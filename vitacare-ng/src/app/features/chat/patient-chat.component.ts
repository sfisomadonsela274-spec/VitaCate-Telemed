import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService, ChatMessage, TypingStatus } from '../../core/services/chat.service';
import { VideoCallService } from '../../core/services/video-call.service';
import { ApiService } from '../../core/services/api.service';
import { Subscription, timer } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { PremiumCardComponent } from '../../shared/components/premium-card.component';
import { InputFieldComponent } from '../../shared/components/input-field.component';
import { VideoCallDialogComponent } from '../../shared/components/video-call-dialog.component';

@Component({
  selector: 'app-patient-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, PremiumCardComponent, InputFieldComponent, VideoCallDialogComponent],
  template: `
    <div class="chat-page">
      <div class="side-nav">
          <button class="back-link" (click)="navigate('/patient-home')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Back</span>
          </button>
          
          <div class="panel-header">
            <h1>Clinical Team</h1>
            <div class="badge">{{ doctors.length }}</div>
          </div>

          <div class="contact-list custom-scroll">
            <div *ngFor="let doc of doctors" 
                 class="contact-item" 
                 [class.active]="selectedDoctor?.id === doc.id"
                 (click)="selectDoctor(doc)">
              <div class="avatar med">{{ doc.first_name?.[0] || 'D' }}</div>
              <div class="contact-info">
                <div class="top">
                   <span class="name">Dr. {{ doc.last_name }}</span>
                   <span class="time">Available</span>
                </div>
                <p class="preview">{{ doc.specialty || 'General Practitioner' }}</p>
              </div>
            </div>
          </div>
      </div>

      <main class="chat-main" [class.mobile-hidden]="!selectedDoctor">
        <header class="chat-header" *ngIf="selectedDoctor">
           <button class="mob-back" (click)="clearSelection()">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <path d="M15 18l-6-6 6-6"/>
              </svg>
           </button>
           <div class="header-avatar">{{ selectedDoctor.first_name?.[0] }}</div>
            <div class="header-info">
               <h2>Dr. {{ selectedDoctor.first_name }} {{ selectedDoctor.last_name }}</h2>
               <div class="connection-pill" [class]="chatStatus$ | async">
                  <span class="dot"></span>
                  <span class="status-text">{{ (chatStatus$ | async) === 'open' ? 'Live' : (chatStatus$ | async) }}</span>
               </div>
            </div>
           
           <div class="header-actions">
              <button class="action-btn" (click)="startVideoCall()" title="Video Call">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                 </svg>
              </button>
           </div>
        </header>

        <div class="chat-messages custom-scroll" #scrollContainer *ngIf="selectedDoctor">
           <div *ngFor="let msg of filteredMessages" class="msg-row" [class.me]="isSentByMe(msg)">
              <div class="bubble-avatar" *ngIf="!isSentByMe(msg)">{{ selectedDoctor.first_name?.[0] }}</div>
              
              <div class="msg-bubble">
                 <!-- Text Content -->
                 <span *ngIf="msg.message">{{ msg.message }}</span>
                 
                 <!-- Image Content -->
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
              <div class="dot-bounce"></div>
              <div class="dot-bounce"></div>
              <div class="dot-bounce"></div>
              <span>Dr. {{ selectedDoctor.last_name }} is typing...</span>
           </div>
           
           <div class="intro-box" *ngIf="filteredMessages.length === 0">
              <div class="intro-avatar">👨‍⚕️</div>
              <h3>Secure Clinical Session</h3>
              <p>Type your concerns or share a photo of your symptoms.</p>
           </div>
        </div>

        <div class="chat-input-row" *ngIf="selectedDoctor">
            <div class="bedside-chips-scroll">
               <div class="chip-track">
                  <button *ngFor="let chip of quickChips" class="bedside-chip" (click)="sendChip(chip)">{{ chip }}</button>
               </div>
            </div>
            
            <div class="input-wrapper">
               <button class="attach-btn" (click)="fileInput.click()">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  <input #fileInput type="file" hidden (change)="onFileSelected($event)" accept="image/*" />
               </button>
               <input type="text" [(ngModel)]="newMessage" (input)="onTyping()" (keyup.enter)="sendMessage()" placeholder="Message..." />
               <button class="send-button" (click)="sendMessage()" [disabled]="!newMessage.trim() && !selectedDoctor">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
               </button>
            </div>
        </div>

        <div class="no-chat-state" *ngIf="!selectedDoctor">
           <div class="illu">🩺</div>
           <h2>Digital Consultation</h2>
           <p>Select a specialist to start your professional clinical consultation.</p>
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
    .panel-header { padding: 0 24px 16px; display: flex; align-items: center; gap: 12px; h1 { font-size: 1.5rem; margin: 0; color: var(--text-dark); } .badge { background: var(--primary-color); color: white; padding: 2px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; } }
    .contact-list { flex: 1; overflow-y: auto; }
    .contact-item { display: flex; align-items: center; gap: 14px; padding: 14px 24px; cursor: pointer; transition: background 0.2s; }
    .contact-item.active { background: #f0f4f2; }
    .avatar { width: 54px; height: 54px; border-radius: 50%; background: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; }
    .contact-info { flex: 1; min-width: 0; .top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; } .name { font-weight: 600; color: var(--text-dark); font-size: 0.95rem; } .preview { font-size: 0.82rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } }
    .chat-main { flex: 1; display: flex; flex-direction: column; background: #fff; position: relative; }
    .chat-header { padding: 16px 30px; border-bottom: 1px solid var(--divider); display: flex; align-items: center; gap: 16px; background: rgba(255,255,255,0.8); position: sticky; top: 0; z-index: 10; }
    .header-info { flex: 1; h2 { font-size: 1.05rem; margin: 0; color: var(--text-dark); } }
    .connection-pill { display: inline-flex; align-items: center; gap: 6px; font-size: 0.7rem; font-weight: 600; padding: 2px 8px; border-radius: 10px; margin-top: 2px; &.open { color: #10b981; background: rgba(16, 185, 129, 0.1); .dot { background: #10b981; box-shadow: 0 0 8px #10b981; } } }
    .action-btn { width: 40px; height: 40px; border-radius: 50%; background: var(--primary-pale); color: var(--primary-color); display: flex; align-items: center; justify-content: center; }
    .chat-messages { flex: 1; overflow-y: auto; padding: 30px; display: flex; flex-direction: column; gap: 8px; background: #fafaf9; }
    .msg-row { display: flex; align-items: flex-end; gap: 10px; margin-bottom: 4px; }
    .msg-row.me { flex-direction: row-reverse; }
    .msg-bubble { max-width: 70%; padding: 12px 16px; border-radius: 20px 20px 20px 4px; background: white; border: 1px solid #f0f0f0; }
    .me .msg-bubble { background: var(--primary-color); color: white; border-radius: 20px 20px 4px 20px; border: none; }
    .msg-img { max-width: 100%; border-radius: 12px; margin-bottom: 8px; display: block; border: 1px solid rgba(0,0,0,0.05); }
    .msg-meta { display: flex; align-items: center; justify-content: flex-end; gap: 4px; margin-top: 4px; font-size: 0.62rem; }
    .typing-indicator { display: flex; align-items: center; gap: 4px; padding: 10px 20px; font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }
    .dot-bounce { width: 4px; height: 4px; border-radius: 50%; background: #94a3b8; animation: bounce 1.4s infinite ease-in-out; }
    .dot-bounce:nth-child(2) { animation-delay: 0.2s; } .dot-bounce:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
    .chat-input-row { padding: 10px 24px 30px; background: white; border-top: 1px solid var(--divider); }
    .input-wrapper { background: #f8fafc; border: 1.5px solid #edf2f7; border-radius: 30px; display: flex; align-items: center; padding: 6px; input { flex: 1; background: none; border: none; outline: none; padding: 12px 14px; font-size: 1rem; } }
    .attach-btn { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); background: none; border: none; transition: color 0.2s; }
    .attach-btn:hover { color: var(--primary-color); }
    .send-button { width: 44px; height: 44px; border-radius: 50%; background: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; }
  `]
})
export class PatientChatComponent implements OnInit, OnDestroy {
  doctors: any[] = [];
  selectedDoctor: any = null;
  messages: ChatMessage[] = [];
  newMessage = '';
  chatStatus$; 
  isPeerTyping = false;
  isVideoActive = false;
  quickChips = ['In Pain 💊', 'Need Water 💧', 'How are my stats? 📈', 'Checkup details?', 'Thank you 🙏'];
  
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
    this.apiService.getDoctors().subscribe(docs => this.doctors = docs);
    this.auth.currentUser$.subscribe(() => {
       const uid = this.auth.userId;
       if (uid) this.chatService.connect(uid);
    });

    this.subs.add(this.chatService.history$.subscribe(msgs => {
      this.messages = msgs;
      this.scrollToBottom();
    }));

    this.subs.add(this.chatService.messages$.subscribe(msg => {
      if (!this.messages.find(m => m.id === msg.id)) {
        this.messages = [...this.messages, msg];
        this.scrollToBottom();
      }
    }));

    this.subs.add(this.chatService.typing$.subscribe((status: TypingStatus) => {
      if (this.selectedDoctor && String(status.sender_id) === String(this.selectedDoctor.id)) {
        this.isPeerTyping = status.is_typing;
        this.scrollToBottom();
      }
    }));
  }

  get filteredMessages(): ChatMessage[] {
    if (!this.selectedDoctor) return [];
    const docId = this.selectedDoctor.id;
    return this.messages.filter(m => 
      String(m.sender_id) === String(docId) || String(m.receiver_id) === String(docId)
    );
  }

  selectDoctor(doc: any) {
    this.selectedDoctor = doc;
    this.chatService.getHistory(doc.id);
  }

  clearSelection() { this.selectedDoctor = null; }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedDoctor) return;
    this.chatService.sendMessage(this.newMessage, this.selectedDoctor.id);
    this.newMessage = '';
    this.sendTypingStatus(false);
    this.scrollToBottom();
  }

  sendChip(chip: string) {
    if (!this.selectedDoctor) return;
    this.chatService.sendMessage(chip, this.selectedDoctor.id);
    this.scrollToBottom();
  }

  onTyping() {
    this.sendTypingStatus(true);
    this.typingTimerSub?.unsubscribe();
    this.typingTimerSub = timer(3000).subscribe(() => this.sendTypingStatus(false));
  }

  sendTypingStatus(isTyping: boolean) {
    if (this.selectedDoctor) {
      this.chatService.sendTypingStatus(isTyping, this.selectedDoctor.id);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file || !this.selectedDoctor) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.chatService.sendMessage('', this.selectedDoctor.id, 'image', reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  startVideoCall() {
    if (!this.selectedDoctor) return;
    this.videoService.connect(this.selectedDoctor.id);
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
