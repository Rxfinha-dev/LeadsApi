import { jest } from '@jest/globals';
import { emailService } from '../services/email.service.js';
import { emailProvider } from '../providers/email.provider.js';

describe('EmailService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      MAIL_USER: 'teste@exemplo.com',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('deve chamar emailProvider.sendMail com os dados corretos', async () => {
    const sendMailSpy = jest
      .spyOn(emailProvider, 'sendMail')
      .mockResolvedValueOnce({} as any);

    const input = {
      to: 'destino@exemplo.com',
      subject: 'Assunto de teste',
      html: '<p>Corpo</p>',
    };

    await emailService.send(input);

    expect(sendMailSpy).toHaveBeenCalledTimes(1);
    expect(sendMailSpy).toHaveBeenCalledWith({
      from: `"Leads API" <${process.env.MAIL_USER}>`,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
  });

  it('deve propagar o erro quando emailProvider.sendMail falhar', async () => {
    const sendMailSpy = jest
      .spyOn(emailProvider, 'sendMail')
      .mockRejectedValueOnce(new Error('Falha ao enviar e-mail'));

    await expect(
      emailService.send({
        to: 'destino@exemplo.com',
        subject: 'Erro',
        html: '<p>Erro</p>',
      }),
    ).rejects.toThrow('Falha ao enviar e-mail');

    expect(sendMailSpy).toHaveBeenCalledTimes(1);
  });
});

