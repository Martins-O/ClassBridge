import { Request, Response } from 'express';
import { webhookService, WEBHOOK_EVENTS } from '../services/webhook.service';

export async function getWebhooks(req: Request, res: Response) {
    try {
        const schoolId = req.query.schoolId as string;
        const webhooks = await webhookService.getWebhooks(schoolId);
        
        const sanitized = webhooks.map(w => ({
            _id: w._id,
            url: w.url,
            events: w.events,
            isActive: w.isActive,
            schoolId: w.schoolId,
            lastTriggeredAt: w.lastTriggeredAt,
            failureCount: w.failureCount,
            createdAt: w.createdAt,
        }));

        res.json({ webhooks: sanitized });
    } catch (error) {
        console.error('Get webhooks error:', error);
        res.status(500).json({ error: 'Failed to fetch webhooks' });
    }
}

export async function createWebhook(req: Request, res: Response) {
    try {
        const { url, events } = req.body;

        if (!url || !events || !Array.isArray(events)) {
            return res.status(400).json({ error: 'URL and events are required' });
        }

        const invalidEvents = events.filter(e => !WEBHOOK_EVENTS.includes(e));
        if (invalidEvents.length > 0) {
            return res.status(400).json({ 
                error: `Invalid events: ${invalidEvents.join(', ')}`,
                validEvents: WEBHOOK_EVENTS,
            });
        }

        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const webhook = await webhookService.createWebhook({
            url,
            events,
            createdBy: 'system',
        });

        res.status(201).json({
            webhook: {
                _id: webhook._id,
                url: webhook.url,
                events: webhook.events,
                secret: webhook.secret,
                isActive: webhook.isActive,
            },
        });
    } catch (error) {
        console.error('Create webhook error:', error);
        res.status(500).json({ error: 'Failed to create webhook' });
    }
}

export async function updateWebhook(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { url, events, isActive } = req.body;

        if (events) {
            const invalidEvents = events.filter((e: string) => !WEBHOOK_EVENTS.includes(e as any));
            if (invalidEvents.length > 0) {
                return res.status(400).json({ 
                    error: `Invalid events: ${invalidEvents.join(', ')}`,
                });
            }
        }

        const webhook = await webhookService.updateWebhook(id, {
            url,
            events,
            isActive,
        });

        if (!webhook) {
            return res.status(404).json({ error: 'Webhook not found' });
        }

        res.json({ webhook });
    } catch (error) {
        console.error('Update webhook error:', error);
        res.status(500).json({ error: 'Failed to update webhook' });
    }
}

export async function deleteWebhook(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const deleted = await webhookService.deleteWebhook(id);

        if (!deleted) {
            return res.status(404).json({ error: 'Webhook not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Delete webhook error:', error);
        res.status(500).json({ error: 'Failed to delete webhook' });
    }
}

export async function regenerateWebhookSecret(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const newSecret = await webhookService.regenerateSecret(id);

        if (!newSecret) {
            return res.status(404).json({ error: 'Webhook not found' });
        }

        res.json({ secret: newSecret });
    } catch (error) {
        console.error('Regenerate secret error:', error);
        res.status(500).json({ error: 'Failed to regenerate secret' });
    }
}

export async function getWebhookEvents(req: Request, res: Response) {
    res.json({ events: WEBHOOK_EVENTS });
}
