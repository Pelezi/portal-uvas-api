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

    public async sendInviteEmail(to: string, link: string, fullname?: string) {
        if (!to) {
            console.warn('EmailService.sendInviteEmail called without recipient (to is empty) - skipping SMTP send. Link:', link);
            console.log(`Invite email to ${to}: ${link}`);
            return;
        }
        const from = process.env.EMAIL_FROM || `no-reply@${process.env.SMTP_HOST || 'example.com'}`;
        const subject = process.env.INVITE_EMAIL_SUBJECT || 'Convite para criar sua conta';
        const html = `Olá ${fullname || ''},<br/><br/>Você foi convidado a criar uma conta. Clique no link abaixo para definir sua senha e acessar o sistema:<br/><a href="${link}">Definir senha</a><br/><br/>Se não solicitou, ignore este e-mail.`;

        if (!this.transporter) {
            console.log(`Invite email to ${to}: ${link}`);
            return;
        }

        try {
            await this.transporter.sendMail({ from, to, subject, html });
        } catch (err) {
            // Log the SMTP error and fallback to console output so invite flow doesn't fail
            console.error('Failed to send invite email, falling back to console. Error:', err);
            console.log(`Invite email to ${to}: ${link}`);
            // do not throw here - allow invite flow to continue using console fallback
            return;
        }
    }
}

export default EmailService;
