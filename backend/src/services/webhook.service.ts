import crypto from 'crypto';
import Webhook from '../models/Webhook';

export interface WebhookPayload {
    event: string;
    timestamp: string;
    data: Record<string, any>;
}

export interface WebhookDeliveryResult {
    success: boolean;
    statusCode?: number;
    error?: string;
}

export class WebhookService {
    async createWebhook(data: {
        url: string;
        events: string[];
        schoolId?: string;
        createdBy: string;
    }): Promise<any> {
        const secret = crypto.randomBytes(32).toString('hex');
        
        const webhook = await Webhook.create({
            url: data.url,
            events: data.events,
            secret,
            schoolId: data.schoolId,
            createdBy: data.createdBy,
            isActive: true,
            failureCount: 0,
        });

        return webhook;
    }

    async getWebhooks(schoolId?: string): Promise<any[]> {
        const query = schoolId ? { schoolId } : {};
        return Webhook.find(query).sort({ createdAt: -1 });
    }

    async getWebhookById(id: string): Promise<any | null> {
        return Webhook.findById(id);
    }

    async updateWebhook(id: string, data: {
        url?: string;
        events?: string[];
        isActive?: boolean;
    }): Promise<any | null> {
        return Webhook.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteWebhook(id: string): Promise<boolean> {
        const result = await Webhook.findByIdAndDelete(id);
        return !!result;
    }

    async triggerWebhooks(event: string, data: Record<string, any>): Promise<void> {
        const webhooks = await Webhook.find({
            events: event,
            isActive: true,
        });

        const payload: WebhookPayload = {
            event,
            timestamp: new Date().toISOString(),
            data,
        };

        await Promise.all(
            webhooks.map(webhook => this.deliverWebhook(webhook, payload))
        );
    }

    async deliverWebhook(webhook: any, payload: WebhookPayload): Promise<WebhookDeliveryResult> {
        const signature = this.generateSignature(webhook.secret, JSON.stringify(payload));

        try {
            const response = await fetch(webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Signature': signature,
                    'X-Webhook-Event': payload.event,
                    'X-Webhook-Timestamp': payload.timestamp,
                },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(10000),
            });

            await Webhook.findByIdAndUpdate(webhook._id, {
                lastTriggeredAt: new Date(),
                failureCount: response.ok ? 0 : webhook.failureCount + 1,
            });

            if (!response.ok && webhook.failureCount >= 5) {
                await Webhook.findByIdAndUpdate(webhook._id, { isActive: false });
            }

            return {
                success: response.ok,
                statusCode: response.status,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            
            await Webhook.findByIdAndUpdate(webhook._id, {
                failureCount: webhook.failureCount + 1,
                lastTriggeredAt: new Date(),
            });

            if (webhook.failureCount >= 4) {
                await Webhook.findByIdAndUpdate(webhook._id, { isActive: false });
            }

            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    private generateSignature(secret: string, payload: string): string {
        return crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');
    }

    async regenerateSecret(id: string): Promise<string | null> {
        const newSecret = crypto.randomBytes(32).toString('hex');
        await Webhook.findByIdAndUpdate(id, { secret: newSecret });
        return newSecret;
    }
}

export const webhookService = new WebhookService();

export const WEBHOOK_EVENTS = [
    'user.created',
    'user.updated',
    'user.deleted',
    'school.created',
    'school.updated',
    'class.created',
    'class.updated',
    'course.created',
    'course.completed',
    'grade.created',
    'grade.updated',
    'assessment.created',
    'assessment.completed',
    'student.enrolled',
    'student.unenrolled',
] as const;

export type WebhookEvent = typeof WEBHOOK_EVENTS[number];
