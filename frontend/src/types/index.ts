export interface Notification {
  id: number;
  recipient_id: number;
  message: string;
  type: 'info' | 'alert';
  read: boolean;
  created_at: string;
}

export interface CreateNotificationData {
  recipient_id: number;
  message: string;
  type: 'info' | 'alert';
  read: boolean;
  created_at: string;
} 