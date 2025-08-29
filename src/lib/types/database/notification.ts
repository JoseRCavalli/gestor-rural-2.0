export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: string;
    notification_key: string;
    channel: string;
    read: boolean | null
    sent_at: string | null
    created_at: string;
    updated_at: string;
}