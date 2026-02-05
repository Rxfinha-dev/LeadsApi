import { jest } from '@jest/globals';
import { BadRequestError, NotFoundError } from '../../../shared/errors/httpErrors.js';

// Mocka os módulos usando ESM
const mockCreateIntentionRepo = jest.fn<any>();
const mockUpdateLeadIdRepo = jest.fn<any>();
const mockVerifyZipcode = jest.fn<any>();
const mockPrismaIntentionFindFirst = jest.fn<any>();
const mockPrismaLeadFindFirst = jest.fn<any>();

jest.unstable_mockModule('../repositories/intentions.repository.js', () => ({
    IntentionsRepository: class {
        createIntention = mockCreateIntentionRepo;
        updateLeadId = mockUpdateLeadIdRepo;
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
            findFirst: mockPrismaIntentionFindFirst,
        },
        lead: {
            findFirst: mockPrismaLeadFindFirst,
        },
    },
}));

const { IntentionsServices } = await import('../services/intentions.services.js');

describe('IntentionsServices', () => {
    let intentionsServices: InstanceType<typeof IntentionsServices>;

    beforeEach(() => {
        jest.clearAllMocks();
        intentionsServices = new IntentionsServices();
    });

    describe('createIntention', () => {
        it('deve criar uma intention com sucesso', async () => {
            const mockIntentionData = {
                zipcode_start: '12345678',
                zipcode_end: '87654321',
            };

            const mockCreatedIntention = {
                id: '123',
                ...mockIntentionData,
                lead_id: null,
                created_at: new Date(),
                updated_at: null,
                deleted_at: null,
            };

            mockVerifyZipcode.mockResolvedValue(undefined);
            mockCreateIntentionRepo.mockResolvedValue(mockCreatedIntention);

            const result = await intentionsServices.createIntention(mockIntentionData);

            expect(mockVerifyZipcode).toHaveBeenCalledWith('12345678');
            expect(mockVerifyZipcode).toHaveBeenCalledWith('87654321');
            expect(mockCreateIntentionRepo).toHaveBeenCalledWith(mockIntentionData);
            expect(result).toEqual(mockCreatedIntention);
        });

        it('deve retornar undefined quando a validação do zipcode falhar', async () => {
            const mockIntentionData = {
                zipcode_start: '12345678',
                zipcode_end: '87654321',
            };

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            mockVerifyZipcode.mockRejectedValue(new Error('CEP inválido'));

            const result = await intentionsServices.createIntention(mockIntentionData);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao criar intention', expect.anything());
            expect(result).toBeUndefined();
            consoleErrorSpy.mockRestore();
        });

        it('deve retornar undefined quando a criação da intention falhar', async () => {
            const mockIntentionData = {
                zipcode_start: '12345678',
                zipcode_end: '87654321',
            };

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            mockVerifyZipcode.mockResolvedValue(undefined);
            mockCreateIntentionRepo.mockRejectedValue(new Error('Database error'));

            const result = await intentionsServices.createIntention(mockIntentionData);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao criar intention', expect.anything());
            expect(result).toBeUndefined();
            consoleErrorSpy.mockRestore();
        });
    });

    describe('updateLeadId', () => {
        it('deve atualizar o lead_id com sucesso', async () => {
            const mockUpdateData = {
                intention_id: '123',
                lead_id: '456',
            };

            const mockIntention = {
                id: '123',
                zipcode_start: '12345678',
                zipcode_end: '87654321',
                lead_id: null,
                created_at: new Date(),
                updated_at: null,
                deleted_at: null,
            };

            const mockLead = {
                id: '456',
                name: 'John Doe',
                email: 'john@example.com',
                deleted_at: null,
                created_at: new Date(),
                updated_at: null,
            };

            const mockUpdatedIntention = {
                ...mockIntention,
                lead_id: '456',
            };

            mockPrismaIntentionFindFirst.mockResolvedValue(mockIntention);
            mockPrismaLeadFindFirst.mockResolvedValue(mockLead);
            mockUpdateLeadIdRepo.mockResolvedValue(mockUpdatedIntention);

            const result = await intentionsServices.updateLeadId(mockUpdateData);

            expect(mockPrismaIntentionFindFirst).toHaveBeenCalledWith({
                where: { id: '123' },
            });
            expect(mockPrismaLeadFindFirst).toHaveBeenCalledWith({
                where: { id: '456' },
            });
            expect(mockUpdateLeadIdRepo).toHaveBeenCalledWith(mockUpdateData);
            expect(result).toEqual(mockUpdatedIntention);
        });

        it('deve retornar undefined quando a intention não existir', async () => {
            const mockUpdateData = {
                intention_id: '123',
                lead_id: '456',
            };

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            mockPrismaIntentionFindFirst.mockResolvedValue(null);

            const result = await intentionsServices.updateLeadId(mockUpdateData);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao atualizar intention', expect.anything());
            expect(result).toBeUndefined();
            consoleErrorSpy.mockRestore();
        });

        it('deve retornar undefined quando a intention já tiver um lead vinculado', async () => {
            const mockUpdateData = {
                intention_id: '123',
                lead_id: '456',
            };

            const mockIntention = {
                id: '123',
                zipcode_start: '12345678',
                zipcode_end: '87654321',
                lead_id: '789',
                created_at: new Date(),
                updated_at: null,
                deleted_at: null,
            };

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            mockPrismaIntentionFindFirst.mockResolvedValue(mockIntention);

            const result = await intentionsServices.updateLeadId(mockUpdateData);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao atualizar intention', expect.anything());
            expect(result).toBeUndefined();
            consoleErrorSpy.mockRestore();
        });

        it('deve retornar undefined quando o lead não existir', async () => {
            const mockUpdateData = {
                intention_id: '123',
                lead_id: '456',
            };

            const mockIntention = {
                id: '123',
                zipcode_start: '12345678',
                zipcode_end: '87654321',
                lead_id: null,
                created_at: new Date(),
                updated_at: null,
                deleted_at: null,
            };

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            mockPrismaIntentionFindFirst.mockResolvedValue(mockIntention);
            mockPrismaLeadFindFirst.mockResolvedValue(null);

            const result = await intentionsServices.updateLeadId(mockUpdateData);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao atualizar intention', expect.anything());
            expect(result).toBeUndefined();
            consoleErrorSpy.mockRestore();
        });

        it('deve retornar undefined quando o lead estiver inativo', async () => {
            const mockUpdateData = {
                intention_id: '123',
                lead_id: '456',
            };

            const mockIntention = {
                id: '123',
                zipcode_start: '12345678',
                zipcode_end: '87654321',
                lead_id: null,
                created_at: new Date(),
                updated_at: null,
                deleted_at: null,
            };

            const mockLead = {
                id: '456',
                name: 'John Doe',
                email: 'john@example.com',
                deleted_at: new Date(),
                created_at: new Date(),
                updated_at: null,
            };

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            mockPrismaIntentionFindFirst.mockResolvedValue(mockIntention);
            mockPrismaLeadFindFirst.mockResolvedValue(mockLead);

            const result = await intentionsServices.updateLeadId(mockUpdateData);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao atualizar intention', expect.anything());
            expect(result).toBeUndefined();
            consoleErrorSpy.mockRestore();
        });

        it('deve retornar undefined quando ocorrer erro no repository', async () => {
            const mockUpdateData = {
                intention_id: '123',
                lead_id: '456',
            };

            const mockIntention = {
                id: '123',
                zipcode_start: '12345678',
                zipcode_end: '87654321',
                lead_id: null,
                created_at: new Date(),
                updated_at: null,
                deleted_at: null,
            };

            const mockLead = {
                id: '456',
                name: 'John Doe',
                email: 'john@example.com',
                deleted_at: null,
                created_at: new Date(),
                updated_at: null,
            };

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            mockPrismaIntentionFindFirst.mockResolvedValue(mockIntention);
            mockPrismaLeadFindFirst.mockResolvedValue(mockLead);
            mockUpdateLeadIdRepo.mockRejectedValue(new Error('Database error'));

            const result = await intentionsServices.updateLeadId(mockUpdateData);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao atualizar intention', expect.anything());
            expect(result).toBeUndefined();
            consoleErrorSpy.mockRestore();
        });
    });
});
