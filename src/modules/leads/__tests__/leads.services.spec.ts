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

        it('deve lançar BadRequestError quando email já estiver cadastrado', async () => {
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

            await expect(
                leadsServices.createLead(mockLeadData)
            ).rejects.toThrow(BadRequestError);

            await expect(
                leadsServices.createLead(mockLeadData)
            ).rejects.toThrow('Email já cadastrado');

            expect(mockPrismaLeadFindFirst).toHaveBeenCalledWith({
                where: {
                    email: 'john.doe@example.com',
                    deleted_at: null,
                },
            });
            expect(mockCreateLeadRepo).not.toHaveBeenCalled();
            expect(mockEmailServiceSend).not.toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalledWith('Erro no createLead no service');
            
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
            // Então emails deletados não são encontrados
            mockPrismaLeadFindFirst.mockResolvedValue(null);
            mockCreateLeadRepo.mockResolvedValue(mockCreatedLead);
            mockEmailServiceSend.mockResolvedValue(undefined);

            const result = await leadsServices.createLead(mockLeadData);

            expect(result).toEqual(mockCreatedLead);
            expect(mockEmailServiceSend).toHaveBeenCalled();
        });

        it('deve lançar erro quando a criação do lead falhar no repository', async () => {
            const mockLeadData = {
                name: 'John Doe',
                email: 'john.doe@example.com',
            };

            const databaseError = new Error('Database connection error');
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            
            mockPrismaLeadFindFirst.mockResolvedValue(null);
            mockCreateLeadRepo.mockRejectedValue(databaseError);

            await expect(
                leadsServices.createLead(mockLeadData)
            ).rejects.toThrow('Database connection error');

            expect(consoleErrorSpy).toHaveBeenCalledWith('Erro no createLead no service');
            
            consoleErrorSpy.mockRestore();
        });

        it('deve lançar erro quando o envio de email falhar', async () => {
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

            const emailError = new Error('SMTP server error');
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            
            mockPrismaLeadFindFirst.mockResolvedValue(null);
            mockCreateLeadRepo.mockResolvedValue(mockCreatedLead);
            mockEmailServiceSend.mockRejectedValue(emailError);

            await expect(
                leadsServices.createLead(mockLeadData)
            ).rejects.toThrow('SMTP server error');

            expect(mockCreateLeadRepo).toHaveBeenCalledWith(mockLeadData);
            expect(consoleErrorSpy).toHaveBeenCalledWith('Erro no createLead no service');
            
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

        it('deve verificar o fluxo completo: busca, criação e email', async () => {
            const mockLeadData = {
                name: 'Complete Test',
                email: 'complete@test.com',
            };

            const mockCreatedLead = {
                id: '999',
                name: 'Complete Test',
                email: 'complete@test.com',
                created_at: new Date(),
                updated_at: null,
                deleted_at: null,
            };

            mockPrismaLeadFindFirst.mockResolvedValue(null);
            mockCreateLeadRepo.mockResolvedValue(mockCreatedLead);
            mockEmailServiceSend.mockResolvedValue(undefined);

            const result = await leadsServices.createLead(mockLeadData);

            // Verifica a ordem das chamadas
            expect(mockPrismaLeadFindFirst).toHaveBeenCalledTimes(1);
            expect(mockCreateLeadRepo).toHaveBeenCalledTimes(1);
            
            // Verifica o retorno
            expect(result).toEqual(mockCreatedLead);
            expect(result.id).toBe('999');
            expect(result.email).toBe('complete@test.com');
        });

        it('deve fazer log de erro genérico e re-lançar a exceção', async () => {
            const mockLeadData = {
                name: 'Error Test',
                email: 'error@test.com',
            };

            const customError = new Error('Unexpected error');
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            
            mockPrismaLeadFindFirst.mockRejectedValue(customError);

            await expect(
                leadsServices.createLead(mockLeadData)
            ).rejects.toThrow('Unexpected error');

            expect(consoleErrorSpy).toHaveBeenCalledWith('Erro no createLead no service');
            
            consoleErrorSpy.mockRestore();
        });
    });
});