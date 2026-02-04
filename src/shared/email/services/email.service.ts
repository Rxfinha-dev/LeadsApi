import type { ISendEmail } from "../interfaces/sendEmail.interface.js";
import { emailProvider } from "../providers/email.provider.js";



class EmailService {
  async send({ to, subject, html }: ISendEmail) {
    await emailProvider.sendMail({
      from: `"Leads API" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });
  }
}

export const emailService = new EmailService();