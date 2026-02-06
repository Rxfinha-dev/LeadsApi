import { IntentionsServices } from '../services/intentions.services.js';
import { BadRequestError, NotFoundError } from '../../../shared/errors/httpErrors.js';
import { prismaClient } from '../../../shared/clients/prismaClient.js';
import { jest } from '@jest/globals';

jest.mock('../repositories/intentions.repository');
jest.mock('../../../shared/helpers/zipcode/services/zipcodeValidation.services');
jest.mock('../../../shared/clients/prismaClient', () => ({
  prismaClient: {
    intention: {
      findFirst: jest.fn(),
    },
    lead: {
      findFirst: jest.fn(),
    },
  },
}));

describe('IntentionsServices', () => {
  let service: IntentionsServices;

  const mockRepository = {
    createIntention: jest.fn(),
    updateLeadId: jest.fn(),
  };

  const mockZipcodeService = {
    verifyZipcode: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // @ts-ignore
    service = new IntentionsServices();

    // sobrescreve dependências privadas
    // @ts-ignore
    service.intentionsRepository = mockRepository;
    // @ts-ignore
    service.zipcodeService = mockZipcodeService;
  });

  describe('createIntention', () => {
    it('deve criar uma intention quando os zipcodes forem válidos', async () => {
      mockZipcodeService.verifyZipcode.mockResolvedValue(undefined);
      mockRepository.createIntention.mockResolvedValue({ id: '1' });

      const result = await service.createIntention({
        zipcode_start: '12345678',
        zipcode_end: '87654321',
      });

      expect(mockZipcodeService.verifyZipcode).toHaveBeenCalledTimes(2);
      expect(mockRepository.createIntention).toHaveBeenCalled();
      expect(result).toEqual({ id: '1' });
    });

    it('deve lançar erro quando zipcode_start for inválido', async () => {
      const error = new BadRequestError('CEP inválido');
      mockZipcodeService.verifyZipcode.mockRejectedValueOnce(error);

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
      mockZipcodeService.verifyZipcode
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
      (prismaClient.intention.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateLeadId({
          intention_id: '1',
          lead_id: '2',
        })
      ).rejects.toThrow(NotFoundError);
    });

    it('deve lançar erro se a intention já tiver lead', async () => {
      (prismaClient.intention.findFirst as jest.Mock).mockResolvedValue({
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
      (prismaClient.intention.findFirst as jest.Mock).mockResolvedValue({
        id: '1',
        lead_id: null,
      });

      (prismaClient.lead.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateLeadId({
          intention_id: '1',
          lead_id: '2',
        })
      ).rejects.toThrow(NotFoundError);
    });

    it('deve lançar erro se o lead estiver inativo', async () => {
      (prismaClient.intention.findFirst as jest.Mock).mockResolvedValue({
        id: '1',
        lead_id: null,
      });

      (prismaClient.lead.findFirst as jest.Mock).mockResolvedValue({
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
      (prismaClient.intention.findFirst as jest.Mock).mockResolvedValue({
        id: '1',
        lead_id: null,
      });

      (prismaClient.lead.findFirst as jest.Mock).mockResolvedValue({
        id: '2',
        deleted_at: null,
      });

      mockRepository.updateLeadId.mockResolvedValue({ success: true });

      const result = await service.updateLeadId({
        intention_id: '1',
        lead_id: '2',
      });

      expect(mockRepository.updateLeadId).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });
  });
});
