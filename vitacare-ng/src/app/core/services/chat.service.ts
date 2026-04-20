import { Injectable } from '@angular/core';
import { Subject, ReplaySubject, BehaviorSubject } from 'rxjs';
import { supabase } from '../supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ChatMessage {
  id?: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  message_type?: 'text' | 'image';
  media_payload?: string;
  timestamp: string;
  is_read?: boolean;
}

export interface TypingStatus {
  sender_id: string;
  is_typing: boolean;
}

export type ConnectionStatus = 'connecting' | 'open' | 'closed' | 'error';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private channel: RealtimeChannel | null = null;
  private currentUserId: string | null = null;
  public messages$ = new Subject<ChatMessage>();
  public history$ = new ReplaySubject<ChatMessage[]>(1);
  public status$ = new BehaviorSubject<ConnectionStatus>('closed');
  public typing$ = new Subject<TypingStatus>();

  connect(userId: string) {
    if (this.currentUserId === userId && this.channel) return;

    this.disconnect();
    this.currentUserId = userId;
    this.status$.next('connecting');

    this.channel = supabase.channel(`inbox_${userId}`, {
      config: { broadcast: { self: true } }
    });

    this.channel.on('broadcast', { event: 'message' }, (p) => {
      this.messages$.next(p['payload'] as ChatMessage);
    });

    this.channel.on('broadcast', { event: 'typing' }, (p) => {
      this.typing$.next(p['payload'] as TypingStatus);
    });

    this.channel.subscribe((status) => {
      this.status$.next(status === 'SUBSCRIBED' ? 'open' : 'closed');
    });
  }

  async getHistory(peerId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .or(`sender_id.eq.${this.currentUserId},receiver_id.eq.${this.currentUserId}`)
      .or(`sender_id.eq.${peerId},receiver_id.eq.${peerId}`)
      .order('timestamp', { ascending: true });

    if (!error && data) {
      this.history$.next(data as ChatMessage[]);
    }
  }

  sendMessage(message: string, receiverId: string, messageType: 'text' | 'image' = 'text', mediaPayload?: string) {
    const payload = {
      type: 'message',
      sender_id: this.currentUserId,
      receiver_id: receiverId,
      message,
      message_type: messageType,
      media_payload: mediaPayload,
      timestamp: new Date().toISOString()
    };

    this.channel?.send({
      type: 'broadcast',
      event: 'message',
      payload
    });
  }

  sendTypingStatus(isTyping: boolean, receiverId: string) {
    this.channel?.send({
      type: 'broadcast',
      event: 'typing',
      payload: { sender_id: this.currentUserId, receiver_id: receiverId, is_typing: isTyping }
    });
  }

  async markAsRead(peerId: string) {
    if (!this.currentUserId) return;
    await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('receiver_id', this.currentUserId)
      .eq('sender_id', peerId)
      .eq('is_read', false);

    this.channel?.send({
      type: 'broadcast',
      event: 'mark_read',
      payload: { sender_id: this.currentUserId, receiver_id: peerId }
    });
  }

  disconnect() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.currentUserId = null;
    this.status$.next('closed');
  }
}
