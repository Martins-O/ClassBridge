import { WebhookService } from '../../src/services/webhook.service';

jest.mock('../../src/models/Webhook', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    count: jest.fn(),
  },
}));

jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue({
    toString: jest.fn().mockReturnValue('mock-secret-123'),
  }),
}));

const Webhook = require('../../src/models/Webhook').default;

describe('WebhookService', () => {
  let webhookService: WebhookService;

  beforeEach(() => {
    webhookService = new WebhookService();
    jest.clearAllMocks();
  });

  describe('createWebhook', () => {
    it('should create a webhook', async () => {
      (Webhook.create as jest.Mock).mockResolvedValue({
        _id: 'webhook-1',
        url: 'https://example.com/webhook',
        events: ['user.created'],
        secret: 'mock-secret',
      });

      const result = await webhookService.createWebhook({
        url: 'https://example.com/webhook',
        events: ['user.created'],
        createdBy: 'user-1',
      });

      expect(result).toBeDefined();
      expect(Webhook.create).toHaveBeenCalled();
    });

    it('should create webhook with schoolId', async () => {
      (Webhook.create as jest.Mock).mockResolvedValue({ _id: 'webhook-1' });

      const result = await webhookService.createWebhook({
        url: 'https://example.com/webhook',
        events: ['user.created'],
        schoolId: 'school-1',
        createdBy: 'user-1',
      });

      expect(Webhook.create).toHaveBeenCalledWith(
        expect.objectContaining({ schoolId: 'school-1' })
      );
    });
  });

  describe('getWebhooks', () => {
    it('should return all webhooks when no schoolId', async () => {
      (Webhook.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue([{ _id: 'webhook-1' }]),
      });

      const result = await webhookService.getWebhooks();

      expect(result).toHaveLength(1);
    });

    it('should filter by schoolId when provided', async () => {
      (Webhook.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue([{ _id: 'webhook-1' }]),
      });

      const result = await webhookService.getWebhooks('school-1');

      expect(Webhook.find).toHaveBeenCalledWith({ schoolId: 'school-1' });
    });
  });

  describe('getWebhookById', () => {
    it('should return webhook by id', async () => {
      (Webhook.findById as jest.Mock).mockResolvedValue({ _id: 'webhook-1' });

      const result = await webhookService.getWebhookById('webhook-1');

      expect(result).toBeDefined();
    });

    it('should return null if not found', async () => {
      (Webhook.findById as jest.Mock).mockResolvedValue(null);

      const result = await webhookService.getWebhookById('webhook-1');

      expect(result).toBeNull();
    });
  });

  describe('updateWebhook', () => {
    it('should update webhook', async () => {
      (Webhook.findByIdAndUpdate as jest.Mock).mockResolvedValue({ _id: 'webhook-1', isActive: false });

      const result = await webhookService.updateWebhook('webhook-1', { isActive: false });

      expect(result).toBeDefined();
    });
  });

  describe('deleteWebhook', () => {
    it('should delete webhook', async () => {
      (Webhook.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: 'webhook-1' });

      const result = await webhookService.deleteWebhook('webhook-1');

      expect(result).toBe(true);
    });

    it('should return false if not found', async () => {
      (Webhook.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      const result = await webhookService.deleteWebhook('webhook-1');

      expect(result).toBe(false);
    });
  });

  describe('getWebhookStats', () => {
    it('should return webhook statistics', async () => {
      (Webhook.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          { _id: 'webhook-1', failureCount: 2 },
          { _id: 'webhook-2', failureCount: 0 },
        ]),
      });
      (Webhook.count as jest.Mock).mockResolvedValue(2);

      const result = await webhookService.getWebhookStats('school-1');

      expect(result).toBeDefined();
      expect(result.totalWebhooks).toBe(2);
    });
  });

  describe('triggerWebhook', () => {
    it('should return false if webhook not found', async () => {
      (Webhook.findById as jest.Mock).mockResolvedValue(null);

      const result = await webhookService.triggerWebhook('webhook-1', {
        event: 'user.created',
        data: {},
      });

      expect(result.success).toBe(false);
    });

    it('should return false if webhook is inactive', async () => {
      (Webhook.findById as jest.Mock).mockResolvedValue({
        _id: 'webhook-1',
        isActive: false,
      });

      const result = await webhookService.triggerWebhook('webhook-1', {
        event: 'user.created',
        data: {},
      });

      expect(result.success).toBe(false);
    });
  });
});