import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

/**
 * Get encryption key from environment or generate a secure one
 * In production, SMTP_ENCRYPTION_KEY must be set in .env
 */
function getEncryptionKey(): Buffer {
    const keyFromEnv = process.env.SMTP_ENCRYPTION_KEY;
    
    if (!keyFromEnv) {
        console.warn('SMTP_ENCRYPTION_KEY not set in .env - using default key (NOT SECURE for production)');
        // Default key for development only
        return crypto.scryptSync('default-smtp-key-change-in-production', 'salt', 32);
    }
    
    // Derive a 32-byte key from the environment variable
    return crypto.scryptSync(keyFromEnv, 'smtp-salt', 32);
}

/**
 * Encrypt SMTP password using AES-256-GCM
 */
export function encryptSmtpPassword(password: string): string {
    if (!password || password.trim() === '') {
        return '';
    }

    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt SMTP password
 */
export function decryptSmtpPassword(encryptedPassword: string | null | undefined): string | null {
    if (!encryptedPassword || encryptedPassword.trim() === '') {
        return null;
    }

    try {
        const parts = encryptedPassword.split(':');
        
        // If doesn't have the expected format, assume it's plaintext (for backward compatibility)
        if (parts.length !== 3) {
            console.warn('SMTP password not in encrypted format - treating as plaintext');
            return encryptedPassword;
        }

        const [ivHex, authTagHex, encryptedData] = parts;
        
        const key = getEncryptionKey();
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('Failed to decrypt SMTP password:', error instanceof Error ? error.message : 'unknown error');
        return null;
    }
}

/**
 * Validate SMTP configuration fields
 */
export function validateSmtpConfig(config: {
    smtpHost?: string | null;
    smtpPort?: number | null;
    smtpUser?: string | null;
    smtpPass?: string | null;
}): { valid: boolean; error?: string } {
    const { smtpHost, smtpPort, smtpUser, smtpPass } = config;
    
    // Check if any SMTP field is provided
    const hasAnySmtpField = smtpHost || smtpPort || smtpUser || smtpPass;
    
    if (!hasAnySmtpField) {
        // No SMTP config provided - valid (will use .env fallback)
        return { valid: true };
    }
    
    // If any field is provided, require the essential ones
    if (!smtpHost || !smtpHost.trim()) {
        return { valid: false, error: 'SMTP host is required when configuring SMTP' };
    }
    
    if (!smtpUser || !smtpUser.trim()) {
        return { valid: false, error: 'SMTP user is required when configuring SMTP' };
    }
    
    if (!smtpPass || !smtpPass.trim()) {
        return { valid: false, error: 'SMTP password is required when configuring SMTP' };
    }
    
    // Validate port if provided
    if (smtpPort !== null && smtpPort !== undefined) {
        const validPorts = [25, 465, 587, 2525];
        if (!validPorts.includes(smtpPort)) {
            return { 
                valid: false, 
                error: `SMTP port must be one of: ${validPorts.join(', ')}. Got: ${smtpPort}` 
            };
        }
    }
    
    return { valid: true };
}
