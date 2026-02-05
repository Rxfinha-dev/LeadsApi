import { jest } from '@jest/globals';
import type { ICreateIntention } from '../interfaces/createIntention.interface.js';
import type { IUpdateLeadId } from '../interfaces/updateIntention.interface.js';

const mockVerifyZipcode = jest.fn();
const mockPrismaIntentionFindFirst = jest.fn();
const mockPrismaLeadFindFirst = jest.fn();
const mockPrismaIntentionCreate = jest.fn();
const mockPrismaIntentionUpdate = jest.fn();

// Mocka o serviço de CEP para não chamar a API externa
jest.unstable_mockModule('../../../shared/zipcode/services/zipcodeValidation.services.js', () => ({
  ZipcodeValidationService: class {
    verifyZipcode = mockVerifyZipcode;
  },
}));

// Mocka o prismaClient usado diretamente no serviço e no repositório
jest.unstable_mockModule('../../../shared/clients/prismaClient.js', () => ({
  prismaClient: {
    intention: {
      findFirst: mockPrismaIntentionFindFirst,
      create: mockPrismaIntentionCreate,
      update: mockPrismaIntentionUpdate,
    },
    lead: {
      findFirst: mockPrismaLeadFindFirst,
    },
  },
}));

const { IntentionsServices } = await import('../services/intentions.services.js');
const { BadRequestError, NotFoundError } = await import('../../../shared/errors/httpErrors.js');

describe('IntentionsServices - createIntention', () => {
  let intentionsServices: InstanceType<typeof IntentionsServices>;

  beforeEach(() => {
    intentionsServices = new IntentionsServices();
    mockVerifyZipcode.mockReset();
    mockPrismaIntentionCreate.mockReset();
  });

  it('deve lançar erro se zipcode_start ou zipcode_end não forem informados', async () => {
    const input = { zipcode_start: '', zipcode_end: '' } as unknown as ICreateIntention;

    await expect(intentionsServices.createIntention(input)).rejects.toBeInstanceOf(
      BadRequestError,
    );

    expect(mockVerifyZipcode).not.toHaveBeenCalled();
    expect(mockPrismaIntentionCreate).not.toHaveBeenCalled();
  });

  it('deve formatar os CEPs e chamar o serviço de validação para cada um, e criar a intenção', async () => {
    const input: ICreateIntention = {
      zipcode_start: '12345-678',
      zipcode_end: '87654-321',
    };

    const fakeIntention = {
      id: 'intention-1',
      zipcode_start: '12345678',
      zipcode_end: '87654321',
    };

    mockVerifyZipcode.mockResolvedValue({});
    mockPrismaIntentionCreate.mockResolvedValue(fakeIntention);

    const result = await intentionsServices.createIntention({ ...input });

    expect(result).toEqual(fakeIntention);
    expect(mockVerifyZipcode).toHaveBeenCalledTimes(2);
    expect(mockVerifyZipcode).toHaveBeenNthCalledWith(1, '12345678');
    expect(mockVerifyZipcode).toHaveBeenNthCalledWith(2, '87654321');

    expect(mockPrismaIntentionCreate).toHaveBeenCalledTimes(1);
    expect(mockPrismaIntentionCreate).toHaveBeenCalledWith({
      data: {
        zipcode_start: '12345678',
        zipcode_end: '87654321',
      },
    });
  });
});

describe('IntentionsServices - updateLeadId', () => {
  let intentionsServices: InstanceType<typeof IntentionsServices>;

  beforeEach(() => {
    intentionsServices = new IntentionsServices();
    mockPrismaIntentionFindFirst.mockReset();
    mockPrismaLeadFindFirst.mockReset();
    mockPrismaIntentionUpdate.mockReset();
  });

  it('deve lançar erro se intentionId não for informado', async () => {
    const input = { intentionId: '', lead_id: '' } as unknown as IUpdateLeadId;

    await expect(intentionsServices.updateLeadId(input)).rejects.toBeInstanceOf(
      BadRequestError,
    );

    expect(mockPrismaIntentionFindFirst).not.toHaveBeenCalled();
  });

  it('deve lançar erro se a intenção não existir', async () => {
    const input: IUpdateLeadId = { intentionId: '1', lead_id: 'lead-1' };

    mockPrismaIntentionFindFirst.mockResolvedValueOnce(null);

    await expect(intentionsServices.updateLeadId(input)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('deve lançar erro se a intenção já possuir lead vinculado', async () => {
    const input: IUpdateLeadId = { intentionId: '1', lead_id: 'lead-1' };

    mockPrismaIntentionFindFirst.mockResolvedValueOnce({
      id: '1',
      lead_id: 'algum-lead',
    });

    await expect(intentionsServices.updateLeadId(input)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it('deve lançar erro se o lead_id não for informado', async () => {
    const input = { intentionId: '1', lead_id: '' } as unknown as IUpdateLeadId;

    mockPrismaIntentionFindFirst.mockResolvedValueOnce({
      id: '1',
      lead_id: null,
    });

    await expect(intentionsServices.updateLeadId(input)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it('deve lançar erro se o lead não existir', async () => {
    const input: IUpdateLeadId = { intentionId: '1', lead_id: 'lead-1' };

    mockPrismaIntentionFindFirst.mockResolvedValueOnce({
      id: '1',
      lead_id: null,
    });
    mockPrismaLeadFindFirst.mockResolvedValueOnce(null);

    await expect(intentionsServices.updateLeadId(input)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('deve lançar erro se o lead estiver inativo (deleted_at definido)', async () => {
    const input: IUpdateLeadId = { intentionId: '1', lead_id: 'lead-1' };

    mockPrismaIntentionFindFirst.mockResolvedValueOnce({
      id: '1',
      lead_id: null,
    });
    mockPrismaLeadFindFirst.mockResolvedValueOnce({
      id: 'lead-1',
      deleted_at: new Date(),
    });

    await expect(intentionsServices.updateLeadId(input)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it('deve atualizar o lead_id da intenção quando tudo estiver válido', async () => {
    const input: IUpdateLeadId = { intentionId: '1', lead_id: 'lead-1' };

    const fakeIntentionUpdated = {
      id: '1',
      lead_id: input.lead_id,
    };

    mockPrismaIntentionFindFirst.mockResolvedValueOnce({
      id: '1',
      lead_id: null,
    });
    mockPrismaLeadFindFirst.mockResolvedValueOnce({
      id: 'lead-1',
      deleted_at: null,
    });
    mockPrismaIntentionUpdate.mockResolvedValueOnce(fakeIntentionUpdated);

    const result = await intentionsServices.updateLeadId(input);

    expect(result).toEqual(fakeIntentionUpdated);
    expect(mockPrismaIntentionFindFirst).toHaveBeenCalledTimes(1);
    expect(mockPrismaLeadFindFirst).toHaveBeenCalledTimes(1);
    expect(mockPrismaIntentionUpdate).toHaveBeenCalledTimes(1);
    expect(mockPrismaIntentionUpdate).toHaveBeenCalledWith({
      data: { lead_id: input.lead_id },
      where: { id: input.intentionId },
    });
  });
});

