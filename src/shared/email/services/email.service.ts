import { error } from "node:console";
import type { ISendEmail } from "../interfaces/sendEmail.interface.js";
import { emailProvider } from "../providers/email.provider.js";



class EmailService {
  async send({ to, subject, html }: ISendEmail) {
    try {
      await emailProvider.sendMail({
        from: `"Leads API" <${process.env.MAIL_USER}>`,
        to,
        subject,
        html,
      });
    } catch (e) {
      console.error("Erro ao enviar o email", error)
    }
  }
}

export const emailService = new EmailService();