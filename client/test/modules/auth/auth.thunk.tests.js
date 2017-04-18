import { spy } from 'sinon';
import { expect } from 'chai';
import auth from '../../../src/modules/auth/auth.thunk';

// Given
let creds = {
  username: 'username',
  password: 'password'
};

describe('I wish to verify that credentials are passed correctly', () => {

  it('Verify that username and password are both used by encodeURIComponent', () => {

    // Spy
    let encodeURIComponentSpy = spy(window, 'encodeURIComponent');

    // When
    auth.encodeCredentials(creds);

    // Then
    expect(encodeURIComponentSpy.callCount).to.be.equal(2);

    // Clean
    encodeURIComponentSpy.reset();
  });
});

describe('I wish to verify the object returned by encodeCredentials', () => {

  it('The method should be equal to POST', () => {

    // When
    let config = auth.encodeCredentials(creds);

    // Then
    expect(config.method).to.be.equal('POST');
  });

  it('Hashs of username and password should be equal to those generated within encodeCredentials', () => {

    // Given
    let hashUsername = window.encodeURIComponent(creds.username);
    let hashPassword = window.encodeURIComponent(creds.password);

    // When
    let config = auth.encodeCredentials(creds);

    // Then
    expect(config.body).to.include('username=' + hashUsername);
    expect(config.body).to.include('password=' + hashPassword);
  });
});
