import { jest } from '@jest/globals';
import type { ICreateLead } from '../interfaces/createLead.interface.js';

const mockFindFirst = jest.fn();
const mockCreate = jest.fn();
const mockSendEmail = jest.fn();

// Mocka prismaClient para não usar o client gerado real
jest.unstable_mockModule('../../../shared/clients/prismaClient.js', () => ({
  prismaClient: {
    lead: {
      findFirst: mockFindFirst,
      create: mockCreate,
    },
  },
}));

// Mocka o serviço de e-mail para não enviar nada de verdade
jest.unstable_mockModule('../../../shared/email/services/email.service.js', () => ({
  emailService: {
    send: mockSendEmail,
  },
}));

const { LeadsServices } = await import('../services/leads.services.js');
const { BadRequestError } = await import('../../../shared/errors/httpErrors.js');

describe('LeadsServices - createLead', () => {
  let leadsServices: InstanceType<typeof LeadsServices>;

  beforeEach(() => {
    leadsServices = new LeadsServices();
    mockFindFirst.mockReset();
    mockCreate.mockReset();
    mockSendEmail.mockReset();
  });

  it('deve lançar erro se name ou email não forem informados', async () => {
    const input = { name: '', email: '' } as unknown as ICreateLead;

    await expect(leadsServices.createLead(input)).rejects.toBeInstanceOf(
      BadRequestError,
    );

    expect(mockFindFirst).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('deve validar tamanho do nome (entre 3 e 100 caracteres)', async () => {
    const pequeno = { name: 'ab', email: 'email-valido-mas-muito-longo@exemplo.com' } as ICreateLead;
    const grande = {
      name: 'a'.repeat(101),
      email: 'email-valido-mas-muito-longo@exemplo.com',
    } as ICreateLead;

    await expect(leadsServices.createLead(pequeno)).rejects.toBeInstanceOf(
      BadRequestError,
    );
    await expect(leadsServices.createLead(grande)).rejects.toBeInstanceOf(
      BadRequestError,
    );

    expect(mockFindFirst).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('deve validar tamanho do email (entre 20 e 100 caracteres segundo a regra atual)', async () => {
    const curto = {
      name: 'Nome Válido',
      email: 'curto@curto.com',
    } as ICreateLead;

    const longoDemais = {
      name: 'Nome Válido',
      email: 'a'.repeat(101) + '@exemplo.com',
    } as ICreateLead;

    await expect(leadsServices.createLead(curto)).rejects.toBeInstanceOf(
      BadRequestError,
    );
    await expect(leadsServices.createLead(longoDemais)).rejects.toBeInstanceOf(
      BadRequestError,
    );

    expect(mockFindFirst).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('deve validar formato de email', async () => {
    const input = {
      name: 'Nome Válido',
      email: 'email-invalido',
    } as ICreateLead;

    await expect(leadsServices.createLead(input)).rejects.toBeInstanceOf(
      BadRequestError,
    );

    expect(mockFindFirst).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('deve lançar erro se o email já estiver cadastrado', async () => {
    const input: ICreateLead = {
      name: 'Nome Válido',
      email: 'email-valido-mas-muito-longo@exemplo.com',
    };

    mockFindFirst.mockResolvedValueOnce({ id: 1, email: input.email });

    await expect(leadsServices.createLead(input)).rejects.toBeInstanceOf(
      BadRequestError,
    );

    expect(mockFindFirst).toHaveBeenCalledTimes(1);
    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('deve criar lead e enviar email quando os dados forem válidos e email não existir', async () => {
    const input: ICreateLead = {
      name: 'Nome Válido',
      email: 'email-valido-mas-muito-longo@exemplo.com',
    };

    const fakeLead = { id: 1, ...input };

    mockFindFirst.mockResolvedValueOnce(null);
    mockCreate.mockResolvedValueOnce(fakeLead);
    mockSendEmail.mockResolvedValueOnce(undefined);

    const result = await leadsServices.createLead(input);

    expect(result).toEqual(fakeLead);
    expect(mockFindFirst).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        name: input.name,
        email: input.email,
      },
    });
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
  });

  it('deve propagar erro caso o envio de email falhe', async () => {
    const input: ICreateLead = {
      name: 'Nome Válido',
      email: 'email-valido-mas-muito-longo@exemplo.com',
    };

    const fakeLead = { id: 1, ...input };

    mockFindFirst.mockResolvedValueOnce(null);
    mockCreate.mockResolvedValueOnce(fakeLead);
    mockSendEmail.mockRejectedValueOnce(new Error('Falha no envio de email'));

    await expect(leadsServices.createLead(input)).rejects.toThrow(
      'Falha no envio de email',
    );

    expect(mockFindFirst).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockSendEmail).toHaveBeenCalledTimes(1);
  });
}
);

