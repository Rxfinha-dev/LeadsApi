import { isEmailValid } from '../isEmailValid.helper.js';

describe('isEmailValid', () => {
  it('deve retornar true para um e-mail válido', () => {
    expect(isEmailValid('teste@example.com')).toBe(true);
  });

  it('deve retornar false para e-mails inválidos', () => {
    expect(isEmailValid('invalido')).toBe(false);
    expect(isEmailValid('sem-arroba.com')).toBe(false);
    expect(isEmailValid('com@espaco .com')).toBe(false);
  });
});

