import { jest } from '@jest/globals';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { BadRequestError } from '../../../shared/errors/httpErrors.js';

// Mocka os módulos usando ESM
const mockCreateLead = jest.fn<any>();
const mockIsEmailValid = jest.fn<any>();

jest.unstable_mockModule('../services/leads.services.js', () => ({
    LeadsServices: class {
        createLead = mockCreateLead;
    },
}));

jest.unstable_mockModule('../../../shared/helpers/isEmailValid.helper.js', () => ({
    isEmailValid: mockIsEmailValid,
}));

const { LeadsController } = await import('../controllers/leads.controller.js');

describe('LeadsController', () => {
    let leadsController: InstanceType<typeof LeadsController>;
    let mockRequest: Partial<FastifyRequest>;
    let mockReply: Partial<FastifyReply>;

    beforeEach(() => {
        jest.clearAllMocks();

        leadsController = new LeadsController();

        mockReply = {
            code: jest.fn<any>().mockReturnThis(),
            send: jest.fn<any>().mockReturnThis(),
        };
    });

    describe('post', () => {
        it('deve criar um lead com sucesso', async () => {
            const mockLeadData = {
                name: 'John Doe',
                email: 'john.doe@example.com.br',
            };

            const mockCreatedLead = {
                id: '123',
                name: 'John Doe',
                email: 'john.doe@example.com.br',
                created_at: new Date(),
                updated_at: null,
                deleted_at: null,
            };

            mockRequest = {
                body: mockLeadData,
            };

            mockIsEmailValid.mockReturnValue(true);
            mockCreateLead.mockResolvedValue(mockCreatedLead);

            await leadsController.post(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockIsEmailValid).toHaveBeenCalledWith('john.doe@example.com.br');
            expect(mockCreateLead).toHaveBeenCalledWith(mockLeadData);
            expect(mockReply.code).toHaveBeenCalledWith(201);
            expect(mockReply.send).toHaveBeenCalledWith(mockCreatedLead);
        });

        it('deve lançar BadRequestError quando name não for fornecido', async () => {
            mockRequest = {
                body: {
                    email: 'john.doe@example.com.br',
                },
            };

            await expect(
                leadsController.post(
                    mockRequest as FastifyRequest,
                    mockReply as FastifyReply
                )
            ).rejects.toThrow(BadRequestError);
        });

        it('deve lançar BadRequestError quando email não for fornecido', async () => {
            mockRequest = {
                body: {
                    name: 'John Doe',
                },
            };

            await expect(
                leadsController.post(
                    mockRequest as FastifyRequest,
                    mockReply as FastifyReply
                )
            ).rejects.toThrow(BadRequestError);
        });

        it('deve lançar BadRequestError quando ambos campos não forem fornecidos', async () => {
            mockRequest = {
                body: {},
            };

            await expect(
                leadsController.post(
                    mockRequest as FastifyRequest,
                    mockReply as FastifyReply
                )
            ).rejects.toThrow(BadRequestError);
        });

        it('deve lançar BadRequestError quando name tiver menos de 3 caracteres', async () => {
            mockRequest = {
                body: {
                    name: 'Jo',
                    email: 'john.doe@example.com.br',
                },
            };

            await expect(
                leadsController.post(
                    mockRequest as FastifyRequest,
                    mockReply as FastifyReply
                )
            ).rejects.toThrow(BadRequestError);
        });

        it('deve lançar BadRequestError quando name tiver mais de 100 caracteres', async () => {
            mockRequest = {
                body: {
                    name: 'A'.repeat(101),
                    email: 'john.doe@example.com.br',
                },
            };

            await expect(
                leadsController.post(
                    mockRequest as FastifyRequest,
                    mockReply as FastifyReply
                )
            ).rejects.toThrow(BadRequestError);
        });

        it('deve aceitar name com exatamente 3 caracteres', async () => {
            const mockLeadData = {
                name: 'Jon',
                email: 'john.doe@example.com.br',
            };

            const mockCreatedLead = {
                id: '123',
                name: 'Jon',
                email: 'john.doe@example.com.br',
                created_at: new Date(),
                updated_at: null,
                deleted_at: null,
            };

            mockRequest = {
                body: mockLeadData,
            };

            mockIsEmailValid.mockReturnValue(true);
            mockCreateLead.mockResolvedValue(mockCreatedLead);

            await leadsController.post(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockReply.code).toHaveBeenCalledWith(201);
            expect(mockReply.send).toHaveBeenCalledWith(mockCreatedLead);
        });

        it('deve aceitar name com exatamente 100 caracteres', async () => {
            const name100chars = 'A'.repeat(100);
            const mockLeadData = {
                name: name100chars,
                email: 'john.doe@example.com.br',
            };

            const mockCreatedLead = {
                id: '123',
                name: name100chars,
                email: 'john.doe@example.com.br',
                created_at: new Date(),
                updated_at: null,
                deleted_at: null,
            };

            mockRequest = {
                body: mockLeadData,
            };

            mockIsEmailValid.mockReturnValue(true);
            mockCreateLead.mockResolvedValue(mockCreatedLead);

            await leadsController.post(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockReply.code).toHaveBeenCalledWith(201);
            expect(mockReply.send).toHaveBeenCalledWith(mockCreatedLead);
        });

        it('deve lançar BadRequestError quando email tiver menos de 10 caracteres', async () => {
            mockRequest = {
                body: {
                    name: 'John Doe',
                    email: 's@mail.br',
                },
            };

            await expect(
                leadsController.post(
                    mockRequest as FastifyRequest,
                    mockReply as FastifyReply
                )
            ).rejects.toThrow(BadRequestError);
        });

        it('deve lançar BadRequestError quando email tiver mais de 100 caracteres', async () => {
            mockRequest = {
                body: {
                    name: 'John Doe',
                    email: 'a'.repeat(90) + '@example.com',
                },
            };

            await expect(
                leadsController.post(
                    mockRequest as FastifyRequest,
                    mockReply as FastifyReply
                )
            ).rejects.toThrow(BadRequestError);
        });

        it('deve aceitar email com exatamente 20 caracteres', async () => {
            const mockLeadData = {
                name: 'John Doe',
                email: 'validtest@email.com', // 20 caracteres
            };

            const mockCreatedLead = {
                id: '123',
                name: 'John Doe',
                email: 'validtest@email.com',
                created_at: new Date(),
                updated_at: null,
                deleted_at: null,
            };

            mockRequest = {
                body: mockLeadData,
            };

            mockIsEmailValid.mockReturnValue(true);
            mockCreateLead.mockResolvedValue(mockCreatedLead);

            await leadsController.post(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockReply.code).toHaveBeenCalledWith(201);
            expect(mockReply.send).toHaveBeenCalledWith(mockCreatedLead);
        });

        it('deve aceitar email com exatamente 100 caracteres', async () => {
            const email100chars = 'a'.repeat(88) + '@example.com'; // 100 caracteres
            const mockLeadData = {
                name: 'John Doe',
                email: email100chars,
            };

            const mockCreatedLead = {
                id: '123',
                name: 'John Doe',
                email: email100chars,
                created_at: new Date(),
                updated_at: null,
                deleted_at: null,
            };

            mockRequest = {
                body: mockLeadData,
            };

            mockIsEmailValid.mockReturnValue(true);
            mockCreateLead.mockResolvedValue(mockCreatedLead);

            await leadsController.post(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockReply.code).toHaveBeenCalledWith(201);
            expect(mockReply.send).toHaveBeenCalledWith(mockCreatedLead);
        });

        it('deve lançar BadRequestError quando email for inválido', async () => {
            mockRequest = {
                body: {
                    name: 'John Doe',
                    email: 'invalid.email.format.com.br.teste',
                },
            };

            mockIsEmailValid.mockReturnValue(false);

            await expect(
                leadsController.post(
                    mockRequest as FastifyRequest,
                    mockReply as FastifyReply
                )
            ).rejects.toThrow(BadRequestError);
        });
    });
});
