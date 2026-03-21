import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

const TOTP_ISSUER = 'ClassBridge';

export interface TwoFactorSetup {
    secret: string;
    qrCodeUrl: string;
    otpauthUrl: string;
}

export interface TwoFactorVerification {
    valid: boolean;
}

export function generateTwoFactorSecret(userEmail: string): TwoFactorSetup {
    const secret = speakeasy.generateSecret({
        name: `${TOTP_ISSUER}:${userEmail}`,
        issuer: TOTP_ISSUER,
        length: 20
    });

    return {
        secret: secret.base32,
        qrCodeUrl: secret.otpauth_url || '',
        otpauthUrl: secret.otpauth_url || ''
    };
}

export async function generateQRCode(otpauthUrl: string): Promise<string> {
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
        return qrCodeDataUrl;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code');
    }
}

export function verifyTwoFactorCode(secret: string, token: string): TwoFactorVerification {
    const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 1
    });

    return { valid: verified };
}

export function generateBackupCodes(count: number = 10): string[] {
    const backupCodes: string[] = [];
    for (let i = 0; i < count; i++) {
        backupCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return backupCodes;
}

export function verifyBackupCode(backupCodes: string[], providedCode: string): boolean {
    const normalizedProvided = providedCode.toUpperCase();
    return backupCodes.includes(normalizedProvided);
}

export function generateRecoveryCodes(): { code: string; hashedCode: string }[] {
    const codes: { code: string; hashedCode: string }[] = [];
    for (let i = 0; i < 10; i++) {
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
        codes.push({ code, hashedCode });
    }
    return codes;
}
