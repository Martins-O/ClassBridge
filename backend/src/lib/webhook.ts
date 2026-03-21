import crypto from 'crypto';
import Webhook from '@/models/Webhook';

export interface WebhookPayload {
    event: string;
    timestamp: string;
    data: Record<string, any>;
}

export async function triggerWebhooks(event: string, data: Record<string, any>): Promise<void> {
    const webhooks = await Webhook.find({
        events: event,
        isActive: true
    });

    const payload: WebhookPayload = {
        event,
        timestamp: new Date().toISOString(),
        data
    };

    for (const webhook of webhooks) {
        try {
            await sendWebhook(webhook.url, webhook.secret, payload);
            
            await Webhook.findByIdAndUpdate(webhook._id, {
                lastTriggeredAt: new Date(),
                failureCount: 0
            });
        } catch (error) {
            console.error(`Webhook delivery failed for ${webhook.url}:`, error);
            
            await Webhook.findByIdAndUpdate(webhook._id, {
                $inc: { failureCount: 1 }
            });
        }
    }
}

async function sendWebhook(url: string, secret: string, payload: WebhookPayload): Promise<void> {
    const body = JSON.stringify(payload);
    const signature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': payload.event,
            'X-Webhook-Timestamp': payload.timestamp
        },
        body,
        signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
        throw new Error(`Webhook delivery failed with status ${response.status}`);
    }
}

export function createWebhookSecret(): string {
    return crypto.randomBytes(32).toString('hex');
}
