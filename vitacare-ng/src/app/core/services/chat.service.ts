import { Injectable } from '@angular/core';
import { Subject, ReplaySubject, BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { CONFIG } from '../config';

export interface ChatMessage {
  id?: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  message_type?: 'text' | 'image';
  media_payload?: string;
  timestamp: string;
  is_read?: boolean;
}

export interface TypingStatus {
  sender_id: number;
  is_typing: boolean;
}

export type ConnectionStatus = 'connecting' | 'open' | 'closed' | 'error';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket: WebSocket | null = null;
  private currentUserId: number | null = null;
  private reconnectAttempts = 0;
  private isManualDisconnect = false;

  public messages$ = new Subject<ChatMessage>();
  public history$ = new ReplaySubject<ChatMessage[]>(1);
  public status$ = new BehaviorSubject<ConnectionStatus>('closed');
  public typing$ = new Subject<TypingStatus>();

  constructor(private auth: AuthService) {}

  connect(userId: number) {
    if (this.currentUserId === userId && this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.currentUserId = userId;
    this.isManualDisconnect = false;
    
    if (this.socket) {
      this.socket.close();
    }
    
    const token = this.auth.accessToken;
    if (!token) {
        this.status$.next('error');
        return;
    }
    
    this.status$.next('connecting');
    
    try {
      this.socket = new WebSocket(`${CONFIG.WS_BASE}/chat/${userId}/?token=${token}`);

      this.socket.onopen = () => {
        this.status$.next('open');
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'message') {
            this.messages$.next(data);
          } else if (data.type === 'message_history') {
            this.history$.next(data.messages);
          } else if (data.type === 'typing') {
            this.typing$.next({ sender_id: data.sender_id, is_typing: data.is_typing });
          }
        } catch (e) {
          console.error('[ChatService] Error parsing socket data', e);
        }
      };

      this.socket.onclose = (event) => {
        this.status$.next('closed');
        if (!this.isManualDisconnect) {
          this.attemptReconnect();
        }
      };

      this.socket.onerror = () => {
        this.status$.next('error');
      };
    } catch (err) {
      this.status$.next('error');
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= CONFIG.MAX_RECONNECT_ATTEMPTS) return;

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
    
    setTimeout(() => {
      if (this.currentUserId && !this.isManualDisconnect) {
        const uid = this.currentUserId;
        this.currentUserId = null; 
        this.connect(uid);
      }
    }, delay);
  }

  getHistory(peerId: number) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'get_messages', peer_id: peerId }));
    }
  }

  sendMessage(message: string, receiverId: number, messageType: 'text' | 'image' = 'text', mediaPayload?: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ 
        type: 'message', 
        message, 
        receiver_id: receiverId,
        message_type: messageType,
        media_payload: mediaPayload
      }));
    }
  }

  sendTypingStatus(isTyping: boolean, receiverId: number) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'typing',
        is_typing: isTyping,
        receiver_id: receiverId
      }));
    }
  }

  markAsRead(peerId: number) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'mark_read', peer_id: peerId }));
    }
  }

  disconnect() {
    this.isManualDisconnect = true;
    this.currentUserId = null;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.status$.next('closed');
  }
}
