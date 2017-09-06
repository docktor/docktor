import { expect } from 'chai';
import { encodeForm } from '../../../src/modules/utils/forms';

describe('I wish to verify the authentification, register, resetPassword and changePasswordAfterReset are using the method POST', () => {

  it('The method should be equal to POST', () => {

    // Given
    let obj = {};

    // When
    let config = encodeForm(obj);

    // Then
    expect(config.method).to.be.equal('POST');
  });
});

describe('I wish to verify that credentials are passed correctly when I log', () => {

  // Given
  let creds = {
    username: 'username',
    password: 'password'
  };

  it('Hashs of username and password should be equal to those generated within encodeInfos (nominal case)', () => {

    // Given
    let encodedUsername = 'username';
    let encodedPassword = 'password';

    // When
    let config = encodeForm(creds);

    // Then
    expect(config.body).to.include('username=' + encodedUsername);
    expect(config.body).to.include('password=' + encodedPassword);
  });

  it('Hashs of username and password should be equal to those generated within encodeInfos (edge case)', () => {

    // Given
    let edgeCaseCreds = {
      username: '!:;@*&,',
      password: '!:;@*&!'
    };

    let encodedUsername = '!%3A%3B%40*%26%2C';
    let encodedPassword = '!%3A%3B%40*%26!';

    // When
    let config = encodeForm(edgeCaseCreds);

    // Then
    expect(config.body).to.include('username=' + encodedUsername);
    expect(config.body).to.include('password=' + encodedPassword);
  });
});

describe('I wish to verify that account\'s infos are passed correctly when I register', () => {

  // Given
  let account = {
    username:   'username',
    password:   'A*P455W0r|/',
    mail:       'mail@example.com',
    firstname:  'firsname',
    lastname:   'lastname'
  };

  it('Hashs of account\'infos should be equal to those generated within encodeInfos', () => {

    // Given
    let encodedUsername = 'username';
    let encodedPassword = 'A*P455W0r%7C%2F';
    let encodedMail = 'mail%40example.com';
    let encodedFirstName = 'firsname';
    let encodedLastName = 'lastname';

    // When
    let config = encodeForm(account);

    // Then
    expect(config.body).to.include('username=' + encodedUsername);
    expect(config.body).to.include('password=' + encodedPassword);
    expect(config.body).to.include('mail=' + encodedMail);
    expect(config.body).to.include('firstname=' + encodedFirstName);
    expect(config.body).to.include('lastname=' + encodedLastName);
  });
});

describe('I wish to verify that username is passed correctly when I reset the password', () => {

  // Given
  let userNameObject = {
    username: 'username'
  };

  it('Hash of username should be equal to the one generated within encodeInfos', () => {

    // Given
    let encodedUsername = 'username';

    // When
    let config = encodeForm(userNameObject);

    // Then
    expect(config.body).to.include(encodedUsername);
  });
});


describe('I wish to verify that username is passed correctly when I change the password after a reset', () => {

  // Given
  let newPwdTokenObject = {
    newPassword:  'newA*P455W0r|/',
    token:        'token'
  };

  it('Hash of username should be equal to the one generated within encodeInfos', () => {

    // Given
    let encodedPassword = 'newA*P455W0r%7C%2F';
    let encodedToken = 'token';
    // When
    let config = encodeForm(newPwdTokenObject);

    // Then
    expect(config.body).to.include(encodedPassword);
    expect(config.body).to.include(encodedToken);
  });
});
