import { jest } from '@jest/globals';
import { BadRequestError, NotFoundError } from '../../../shared/errors/httpErrors.js';

const mockCreateIntention = jest.fn<any>();
const mockUpdateLeadId = jest.fn<any>();
const mockVerifyZipcode = jest.fn<any>();
const mockIntentionFindFirst = jest.fn<any>();
const mockLeadFindFirst = jest.fn<any>();

jest.unstable_mockModule('../repositories/intentions.repository.js', () => ({
  IntentionsRepository: class {
    createIntention = mockCreateIntention;
    updateLeadId = mockUpdateLeadId;
  },
}));

jest.unstable_mockModule('../../../shared/helpers/zipcode/services/zipcodeValidation.services.js', () => ({
  ZipcodeValidationService: class {
    verifyZipcode = mockVerifyZipcode;
  },
}));

jest.unstable_mockModule('../../../shared/clients/prismaClient.js', () => ({
  prismaClient: {
    intention: {
      findFirst: mockIntentionFindFirst,
    },
    lead: {
      findFirst: mockLeadFindFirst,
    },
  },
}));

const { IntentionsServices } = await import('../services/intentions.services.js');

describe('IntentionsServices', () => {
  let service: InstanceType<typeof IntentionsServices>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new IntentionsServices();
  });

  describe('createIntention', () => {
    it('deve criar uma intention quando os zipcodes forem válidos', async () => {
      mockVerifyZipcode.mockResolvedValue(undefined);
      mockCreateIntention.mockResolvedValue({ id: '1' });

      const result = await service.createIntention({
        zipcode_start: '12345678',
        zipcode_end: '87654321',
      });

      expect(mockVerifyZipcode).toHaveBeenCalledTimes(2);
      expect(mockCreateIntention).toHaveBeenCalled();
      expect(result).toEqual({ id: '1' });
    });

    it('deve lançar erro quando zipcode_start for inválido', async () => {
      const error = new BadRequestError('CEP inválido');
      mockVerifyZipcode.mockRejectedValueOnce(error);

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      await expect(
        service.createIntention({
          zipcode_start: '000',
          zipcode_end: '87654321',
        })
      ).rejects.toThrow(error);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Erro no createIntention no service'
      );

      consoleSpy.mockRestore();
    });

    it('deve lançar erro quando zipcode_end for inválido', async () => {
      mockVerifyZipcode
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new BadRequestError('CEP inválido'));

      await expect(
        service.createIntention({
          zipcode_start: '12345678',
          zipcode_end: '000',
        })
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('updateLeadId', () => {
    it('deve lançar erro se a intention não existir', async () => {
      mockIntentionFindFirst.mockResolvedValue(null);

      await expect(
        service.updateLeadId({
          intention_id: '1',
          lead_id: '2',
        })
      ).rejects.toThrow(NotFoundError);
    });

    it('deve lançar erro se a intention já tiver lead', async () => {
      mockIntentionFindFirst.mockResolvedValue({
        id: '1',
        lead_id: '123',
      });

      await expect(
        service.updateLeadId({
          intention_id: '1',
          lead_id: '2',
        })
      ).rejects.toThrow(BadRequestError);
    });

    it('deve lançar erro se o lead não existir', async () => {
      mockIntentionFindFirst.mockResolvedValue({
        id: '1',
        lead_id: null,
      });

      mockLeadFindFirst.mockResolvedValue(null);

      await expect(
        service.updateLeadId({
          intention_id: '1',
          lead_id: '2',
        })
      ).rejects.toThrow(NotFoundError);
    });

    it('deve lançar erro se o lead estiver inativo', async () => {
      mockIntentionFindFirst.mockResolvedValue({
        id: '1',
        lead_id: null,
      });

      mockLeadFindFirst.mockResolvedValue({
        id: '2',
        deleted_at: new Date(),
      });

      await expect(
        service.updateLeadId({
          intention_id: '1',
          lead_id: '2',
        })
      ).rejects.toThrow(BadRequestError);
    });

    it('deve atualizar o lead com sucesso', async () => {
      mockIntentionFindFirst.mockResolvedValue({
        id: '1',
        lead_id: null,
      });

      mockLeadFindFirst.mockResolvedValue({
        id: '2',
        deleted_at: null,
      });

      mockUpdateLeadId.mockResolvedValue({ success: true });

      const result = await service.updateLeadId({
        intention_id: '1',
        lead_id: '2',
      });

      expect(mockUpdateLeadId).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });
});