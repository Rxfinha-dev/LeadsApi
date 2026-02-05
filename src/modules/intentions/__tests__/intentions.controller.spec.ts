import { jest } from '@jest/globals';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { BadRequestError } from '../../../shared/errors/httpErrors.js';

// Mocka os módulos usando ESM
const mockCreateIntention = jest.fn<any>();
const mockUpdateLeadId = jest.fn<any>();
const mockFormatZipcode = jest.fn<any>();

jest.unstable_mockModule('../services/intentions.services.js', () => ({
    IntentionsServices: class {
        createIntention = mockCreateIntention;
        updateLeadId = mockUpdateLeadId;
    },
}));

jest.unstable_mockModule('../../../shared/helpers/zipcodeFormatter.helper.js', () => ({
    formatZipcode: mockFormatZipcode,
}));

const { IntentionsController } = await import('../controllers/intentions.controller.js');

describe('IntentionsController', () => {
    let intentionsController: InstanceType<typeof IntentionsController>;
    let mockRequest: Partial<FastifyRequest>;
    let mockReply: Partial<FastifyReply>;

    beforeEach(() => {
        jest.clearAllMocks();
        
        intentionsController = new IntentionsController();

        mockReply = {
            code: jest.fn<any>().mockReturnThis(),
            send: jest.fn<any>().mockReturnThis(),
        };
    });

    describe('createIntention', () => {
        it('deve criar uma intention com sucesso', async () => {
            const mockIntentionData = {
                zipcode_start: '12345-678',
                zipcode_end: '87654-321',
            };

            const mockCreatedIntention = {
                id: '123',
                zipcode_start: '12345678',
                zipcode_end: '87654321',
                lead_id: null,
                created_at: new Date(),
                updated_at: null,
                deleted_at: null,
            };

            mockRequest = {
                body: mockIntentionData,
            };

            mockFormatZipcode
                .mockReturnValueOnce('12345678')
                .mockReturnValueOnce('87654321');

            mockCreateIntention.mockResolvedValue(mockCreatedIntention);

            await intentionsController.createIntention(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockFormatZipcode).toHaveBeenCalledWith('12345-678');
            expect(mockFormatZipcode).toHaveBeenCalledWith('87654-321');
            expect(mockCreateIntention).toHaveBeenCalledWith({
                zipcode_start: '12345678',
                zipcode_end: '87654321',
            });
            expect(mockReply.code).toHaveBeenCalledWith(201);
            expect(mockReply.send).toHaveBeenCalledWith(mockCreatedIntention);
        });

        it('deve lançar BadRequestError quando zipcode_start não for fornecido', async () => {
            mockRequest = {
                body: {
                    zipcode_end: '87654-321',
                },
            };

            await expect(
                intentionsController.createIntention(
                    mockRequest as FastifyRequest,
                    mockReply as FastifyReply
                )
            ).rejects.toThrow(BadRequestError);
        });

        it('deve lançar BadRequestError quando zipcode_end não for fornecido', async () => {
            mockRequest = {
                body: {
                    zipcode_start: '12345-678',
                },
            };

            await expect(
                intentionsController.createIntention(
                    mockRequest as FastifyRequest,
                    mockReply as FastifyReply
                )
            ).rejects.toThrow(BadRequestError);
        });

        it('deve lançar BadRequestError quando ambos zipcodes não forem fornecidos', async () => {
            mockRequest = {
                body: {},
            };

            await expect(
                intentionsController.createIntention(
                    mockRequest as FastifyRequest,
                    mockReply as FastifyReply
                )
            ).rejects.toThrow(BadRequestError);
        });
    });

    describe('updateLeadId', () => {
        it('deve atualizar o lead_id da intention com sucesso', async () => {
            const mockParams = { intention_id: '123' };
            const mockBody = { lead_id: '456' };
            const mockUpdatedIntention = {
                id: '123',
                zipcode_start: '12345678',
                zipcode_end: '87654321',
                lead_id: '456',
                created_at: new Date(),
                updated_at: null,
                deleted_at: null,
            };

            mockRequest = {
                params: mockParams,
                body: mockBody,
            };

            mockUpdateLeadId.mockResolvedValue(mockUpdatedIntention);

            await intentionsController.updateLeadId(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockUpdateLeadId).toHaveBeenCalledWith({
                intention_id: '123',
                lead_id: '456',
            });
            expect(mockReply.send).toHaveBeenCalledWith(mockUpdatedIntention);
        });

        it('deve lançar BadRequestError quando intention_id não for fornecido', async () => {
            mockRequest = {
                params: {},
                body: { lead_id: '456' },
            };

            await expect(
                intentionsController.updateLeadId(
                    mockRequest as FastifyRequest,
                    mockReply as FastifyReply
                )
            ).rejects.toThrow(BadRequestError);
        });

        it('deve lançar BadRequestError quando lead_id não for fornecido', async () => {
            mockRequest = {
                params: { intention_id: '123' },
                body: {},
            };

            await expect(
                intentionsController.updateLeadId(
                    mockRequest as FastifyRequest,
                    mockReply as FastifyReply
                )
            ).rejects.toThrow(BadRequestError);
        });
    });
});
