import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        const host = process.env.SMTP_HOST;
        const port = Number(process.env.SMTP_PORT || '587');
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        if (host && user) {
            this.transporter = nodemailer.createTransport({
                host,
                port,
                secure: port === 465,
                auth: user && pass ? { user, pass } : undefined
            });
        }
    }

    public async sendWelcomeEmail(to: string, loginLink: string, fullname: string, defaultPassword: string, matrixName: string = 'Portal Uvas') {
        if (!to) {
            console.warn('EmailService.sendWelcomeEmail called without recipient (to is empty) - skipping SMTP send.');
            return;
        }
        const from = process.env.EMAIL_FROM || `no-reply@${process.env.SMTP_HOST || 'example.com'}`;
        const platformName = matrixName ? `Portal Uvas - ${matrixName}` : 'Portal Uvas';
        const subject = `Bem-vindo ao ${platformName}`;
        const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo ao Portal Uvas</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🎉 Bem-vindo!</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Olá <strong>${fullname}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 25px; color: #666666; font-size: 16px; line-height: 1.6;">
                                Seu acesso ao <strong>${platformName}</strong> foi ativado com sucesso! Estamos felizes em tê-lo(a) conosco.
                            </p>
                            
                            <!-- Credentials Box -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8f9fa; border-radius: 6px; margin: 25px 0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 12px; color: #666666; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                            Suas credenciais de acesso:
                                        </p>
                                        <p style="margin: 0 0 8px; color: #333333; font-size: 15px;">
                                            <strong>Email:</strong> ${to}
                                        </p>
                                        <p style="margin: 0; color: #333333; font-size: 15px;">
                                            <strong>Senha temporária:</strong> <code style="background-color: #e9ecef; padding: 2px 8px; border-radius: 4px; font-family: 'Courier New', monospace; color: #d63384;">${defaultPassword}</code>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Warning -->
                            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 4px;">
                                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                                    ⚠️ <strong>Importante:</strong> Por segurança, altere sua senha no primeiro acesso.
                                </p>
                            </div>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${loginLink}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                                            Acessar o Sistema
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 25px 0 0; color: #999999; font-size: 14px; line-height: 1.6;">
                                Se você não solicitou este acesso, entre em contato com o administrador imediatamente.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0; color: #999999; font-size: 13px; line-height: 1.5;">
                                Este é um email automático, por favor não responda.<br>
                                © ${new Date().getFullYear()} ${platformName}. Todos os direitos reservados.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

        if (!this.transporter) {
            console.log(`Welcome email to ${to}. Login: ${to}, Password: ${defaultPassword}, Link: ${loginLink}`);
            return;
        }

        try {
            await this.transporter.sendMail({ from, to, subject, html });
        } catch (err: unknown) {
            console.error('Failed to send welcome email, falling back to console. Error:', err);
            console.log(`Welcome email to ${to}. Login: ${to}, Password: ${defaultPassword}, Link: ${loginLink}`);
            return;
        }
    }

    public async sendPasswordResetEmail(to: string, resetLink: string, fullname: string, matrixName: string = 'Portal Uvas') {
        if (!to) {
            console.warn('EmailService.sendPasswordResetEmail called without recipient (to is empty) - skipping SMTP send.');
            return;
        }
        const from = process.env.EMAIL_FROM || `no-reply@${process.env.SMTP_HOST || 'example.com'}`;
        const platformName = matrixName ? `Portal Uvas - ${matrixName}` : 'Portal Uvas';
        const subject = `Redefinição de Senha - ${platformName}`;
        const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redefinição de Senha</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🔐 Redefinição de Senha</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Olá <strong>${fullname}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 25px; color: #666666; font-size: 16px; line-height: 1.6;">
                                Recebemos uma solicitação para redefinir a senha da sua conta no <strong>${platformName}</strong>.
                            </p>
                            
                            <p style="margin: 0 0 25px; color: #666666; font-size: 16px; line-height: 1.6;">
                                Clique no botão abaixo para criar uma nova senha:
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${resetLink}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(245, 87, 108, 0.3);">
                                            Redefinir Senha
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Time Warning -->
                            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 4px;">
                                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                                    ⏱️ <strong>Atenção:</strong> Este link é válido por apenas <strong>1 hora</strong>.
                                </p>
                            </div>
                            
                            <!-- Alternative Link -->
                            <p style="margin: 25px 0; color: #999999; font-size: 13px; line-height: 1.6;">
                                Se o botão acima não funcionar, copie e cole o seguinte link no seu navegador:<br>
                                <a href="${resetLink}" style="color: #f5576c; word-break: break-all;">${resetLink}</a>
                            </p>
                            
                            <!-- Security Notice -->
                            <div style="background-color: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin: 25px 0; border-radius: 4px;">
                                <p style="margin: 0; color: #0c5460; font-size: 14px; line-height: 1.5;">
                                    🛡️ <strong>Não solicitou esta redefinição?</strong><br>
                                    Se você não solicitou a redefinição de senha, ignore este email. Sua senha permanecerá inalterada e segura.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0 0 10px; color: #666666; font-size: 13px; line-height: 1.5;">
                                Atenciosamente,<br>
                                <strong>Equipe ${platformName}</strong>
                            </p>
                            <p style="margin: 10px 0 0; color: #999999; font-size: 13px; line-height: 1.5;">
                                Este é um email automático, por favor não responda.<br>
                                © ${new Date().getFullYear()} ${platformName}. Todos os direitos reservados.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

        if (!this.transporter) {
            console.log(`Password reset email to ${to}. Link: ${resetLink}`);
            return;
        }

        try {
            await this.transporter.sendMail({ from, to, subject, html });
        } catch (err: unknown) {
            console.error('Failed to send password reset email, falling back to console. Error:', err);
            console.log(`Password reset email to ${to}. Link: ${resetLink}`);
            return;
        }
    }
}

export default EmailService;
