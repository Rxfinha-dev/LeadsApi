import { jest } from '@jest/globals';
import { BadRequestError } from '../../../shared/errors/httpErrors.js';

// Mocka os módulos usando ESM
const mockCreateLeadRepo = jest.fn<any>();
const mockPrismaLeadFindFirst = jest.fn<any>();
const mockEmailServiceSend = jest.fn<any>();

jest.unstable_mockModule('../repositories/leads.repository.js', () => ({
    LeadsRepository: class {
        createLead = mockCreateLeadRepo;
    },
}));

jest.unstable_mockModule('../../../shared/clients/prismaClient.js', () => ({
    prismaClient: {
        lead: {
            findFirst: mockPrismaLeadFindFirst,
        },
    },
}));

jest.unstable_mockModule('../../../shared/email/services/email.service.js', () => ({
    emailService: {
        send: mockEmailServiceSend,
    },
}));

const { LeadsServices } = await import('../services/leads.services.js');

describe('LeadsServices', () => {
    let leadsServices: InstanceType<typeof LeadsServices>;

    beforeEach(() => {
        jest.clearAllMocks();
        leadsServices = new LeadsServices();
    });

    describe('createLead', () => {
        it('deve criar um lead e enviar email com sucesso', async () => {
            const mockLeadData = {
                name: 'John Doe',
                email: 'john.doe@example.com',
            };

            const mockCreatedLead = {
                id: '123',
                name: 'John Doe',
                email: 'john.doe@example.com',
                created_at: new Date(),
                updated_at: null,
                deleted_at: null,
            };

            mockPrismaLeadFindFirst.mockResolvedValue(null);
            mockCreateLeadRepo.mockResolvedValue(mockCreatedLead);
            mockEmailServiceSend.mockResolvedValue(undefined);

            const result = await leadsServices.createLead(mockLeadData);

            expect(mockPrismaLeadFindFirst).toHaveBeenCalledWith({
                where: {
                    email: 'john.doe@example.com',
                    deleted_at: null,
                },
            });
            expect(mockCreateLeadRepo).toHaveBeenCalledWith(mockLeadData);
            expect(mockEmailServiceSend).toHaveBeenCalledWith({
                to: 'john.doe@example.com',
                subject: 'Bem-vindo!',
                html: expect.stringContaining('Olá John Doe'),
            });
            expect(mockEmailServiceSend).toHaveBeenCalledWith({
                to: 'john.doe@example.com',
                subject: 'Bem-vindo!',
                html: expect.stringContaining('Muito obrigado por consultar conosco!'),
            });
            expect(result).toEqual(mockCreatedLead);
        });

        it('deve enviar email com saudação padrão quando name for null', async () => {
            const mockLeadData = {
                name: null as any,
                email: 'john.doe@example.com',
            };

            const mockCreatedLead = {
                id: '123',
                name: null,
                email: 'john.doe@example.com',
                created_at: new Date(),
                updated_at: null,
                deleted_at: null,
            };

            mockPrismaLeadFindFirst.mockResolvedValue(null);
            mockCreateLeadRepo.mockResolvedValue(mockCreatedLead);
            mockEmailServiceSend.mockResolvedValue(undefined);

            const result = await leadsServices.createLead(mockLeadData);

            expect(mockEmailServiceSend).toHaveBeenCalledWith({
                to: 'john.doe@example.com',
                subject: 'Bem-vindo!',
                html: expect.stringContaining('Olá !'),
            });
            expect(result).toEqual(mockCreatedLead);
        });

        it('deve enviar email com saudação padrão quando name for undefined', async () => {
            const mockLeadData = {
                name: undefined as any,
                email: 'john.doe@example.com',
            };

            const mockCreatedLead = {
                id: '123',
                name: undefined,
                email: 'john.doe@example.com',
                created_at: new Date(),
                updated_at: null,
                deleted_at: null,
            };

            mockPrismaLeadFindFirst.mockResolvedValue(null);
            mockCreateLeadRepo.mockResolvedValue(mockCreatedLead);
            mockEmailServiceSend.mockResolvedValue(undefined);

            const result = await leadsServices.createLead(mockLeadData);

            expect(mockEmailServiceSend).toHaveBeenCalledWith({
                to: 'john.doe@example.com',
                subject: 'Bem-vindo!',
                html: expect.stringContaining('Olá !'),
            });
            expect(result).toEqual(mockCreatedLead);
        });

        it('deve retornar undefined quando email já estiver cadastrado', async () => {
            const mockLeadData = {
                name: 'John Doe',
                email: 'john.doe@example.com',
            };

            const existingLead = {
                id: '456',
                name: 'John Doe',
                email: 'john.doe@example.com',
                created_at: new Date(),
                updated_at: null,
                deleted_at: null,
            };

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            mockPrismaLeadFindFirst.mockResolvedValue(existingLead);

            const result = await leadsServices.createLead(mockLeadData);

            expect(mockPrismaLeadFindFirst).toHaveBeenCalledWith({
                where: {
                    email: 'john.doe@example.com',
                    deleted_at: null,
                },
            });
            expect(mockCreateLeadRepo).not.toHaveBeenCalled();
            expect(mockEmailServiceSend).not.toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao criar lead', expect.anything());
            expect(result).toBeUndefined();
            consoleErrorSpy.mockRestore();
        });

        it('deve permitir cadastro de email que estava deletado (deleted_at não é null)', async () => {
            const mockLeadData = {
                name: 'John Doe',
                email: 'john.doe@example.com',
            };

            const mockCreatedLead = {
                id: '789',
                name: 'John Doe',
                email: 'john.doe@example.com',
                created_at: new Date(),
                updated_at: null,
                deleted_at: null,
            };

            // A busca retorna null porque o where inclui deleted_at: null
            mockPrismaLeadFindFirst.mockResolvedValue(null);
            mockCreateLeadRepo.mockResolvedValue(mockCreatedLead);
            mockEmailServiceSend.mockResolvedValue(undefined);

            const result = await leadsServices.createLead(mockLeadData);

            expect(result).toEqual(mockCreatedLead);
            expect(mockEmailServiceSend).toHaveBeenCalled();
        });

        it('deve retornar undefined quando a criação do lead falhar', async () => {
            const mockLeadData = {
                name: 'John Doe',
                email: 'john.doe@example.com',
            };

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            mockPrismaLeadFindFirst.mockResolvedValue(null);
            mockCreateLeadRepo.mockRejectedValue(new Error('Database error'));

            const result = await leadsServices.createLead(mockLeadData);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao criar lead', expect.anything());
            expect(result).toBeUndefined();
            consoleErrorSpy.mockRestore();
        });

        it('deve retornar undefined quando o envio de email falhar', async () => {
            const mockLeadData = {
                name: 'John Doe',
                email: 'john.doe@example.com',
            };

            const mockCreatedLead = {
                id: '123',
                name: 'John Doe',
                email: 'john.doe@example.com',
                created_at: new Date(),
                updated_at: null,
                deleted_at: null,
            };

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            mockPrismaLeadFindFirst.mockResolvedValue(null);
            mockCreateLeadRepo.mockResolvedValue(mockCreatedLead);
            mockEmailServiceSend.mockRejectedValue(new Error('Email service error'));

            const result = await leadsServices.createLead(mockLeadData);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao criar lead', expect.anything());
            expect(result).toBeUndefined();
            consoleErrorSpy.mockRestore();
        });

        it('deve verificar que o email contém o nome correto quando fornecido', async () => {
            const mockLeadData = {
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
            };

            const mockCreatedLead = {
                id: '123',
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                created_at: new Date(),
                updated_at: null,
                deleted_at: null,
            };

            mockPrismaLeadFindFirst.mockResolvedValue(null);
            mockCreateLeadRepo.mockResolvedValue(mockCreatedLead);
            mockEmailServiceSend.mockResolvedValue(undefined);

            await leadsServices.createLead(mockLeadData);

            expect(mockEmailServiceSend).toHaveBeenCalledWith({
                to: 'jane.smith@example.com',
                subject: 'Bem-vindo!',
                html: expect.stringContaining('Olá Jane Smith'),
            });
        });

        it('deve criar lead mesmo que o email de boas-vindas falhe', async () => {
            const mockLeadData = {
                name: 'John Doe',
                email: 'john.doe@example.com',
            };

            const mockCreatedLead = {
                id: '123',
                name: 'John Doe',
                email: 'john.doe@example.com',
                created_at: new Date(),
                updated_at: null,
                deleted_at: null,
            };

            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            mockPrismaLeadFindFirst.mockResolvedValue(null);
            mockCreateLeadRepo.mockResolvedValue(mockCreatedLead);
            mockEmailServiceSend.mockRejectedValue(new Error('SMTP error'));

            const result = await leadsServices.createLead(mockLeadData);

            expect(mockCreateLeadRepo).toHaveBeenCalledWith(mockLeadData);
            expect(consoleErrorSpy).toHaveBeenCalled();
            expect(result).toBeUndefined();
            consoleErrorSpy.mockRestore();
        });
    });
});
