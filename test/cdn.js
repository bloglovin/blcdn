/* jshint node: true */
/*global suite, test, before */
'use strict';

var lib = {
  assert: require('assert'),
  url: require('url'),
  path: require('path'),
  Cdn: require('../index')
};

var assert = lib.assert;

suite('CDN - options', function testDefaults() {
  test('Check defaults', function checkDefaults() {
    var cdn = new lib.Cdn();
    assert.equal(cdn.schema, 'https:', 'Schema didn\'t default to https');
    assert.equal(cdn.salt, null, 'A made up salt was used');
    assert.deepEqual(cdn.hosts, [
      'cdn1.blovcdn.com',
      'cdn2.blovcdn.com',
      'cdn3.blovcdn.com'
    ], 'The cdn servers didn\'t have the correct defaults');
  });

  test('Signing with defaults', function sign() {
    var cdn = new lib.Cdn();
    var exampleUrl = 'http://example.com/image.jpg';
    var exampleCdnUrl = 'https://cdn2.blovcdn.com/bloglovin/f0b61f44ad677caeb882e6a3b7850b86ef10e6f2/s/aHR0cCUzQSUyRiUyRmV4YW1wbGUuY29tJTJGaW1hZ2UuanBn';

    assert.equal(cdn.imageUrl(exampleUrl), exampleCdnUrl, 'Url signed with default options didn\'t match');
  });

  test('Signing without ssl', function sign() {
    var cdn = new lib.Cdn({noSsl:true});
    var exampleUrl = 'http://example.com/image.jpg';
    var exampleCdnUrl = 'http://cdn2.blovcdn.com/bloglovin/f0b61f44ad677caeb882e6a3b7850b86ef10e6f2/s/aHR0cCUzQSUyRiUyRmV4YW1wbGUuY29tJTJGaW1hZ2UuanBn';

    assert.equal(cdn.imageUrl(exampleUrl), exampleCdnUrl, 'Url signed without ssl didn\'t match');
  });
});

suite('CDN - conformance', function testProcessing() {
  var testData = require('./cases.json');
  var cases = testData.cases;
  var cdn;

  // It's not strictly necessary to run tests with the real salt, but now it's
  // possible at least, always nice to have a hard reality check ;)
  if (process.env.CDN_SALT) {
    cdn = new lib.Cdn({
      salt: process.env.CDN_SALT,
      hosts: testData.hosts
    });
  }

  var reCdn = new lib.Cdn({
    salt: testData.salt,
    hosts: testData.hosts
  });

  test('Check encode method', function checkEncode() {
    cases.forEach(function checkTestCase(info, idx) {
      assert.equal(reCdn.encodeUrl(info.url), info.encoded,
         'Encode (urlencode+base64) of url ' + idx + ' (' + info.url + ') didn\'t match');
    });
  });

  test('Check host mapping', function checkHost() {
    cases.forEach(function checkTestCase(info, idx) {
      assert.equal(reCdn.getHost(info.encoded), info.host,
         'CDN host from url ' + idx + ' (' + info.url + ') didn\'t match');
    });
  });

  // Run the signing-dependent tests if we have a CDN instance with the real salt.
  if (cdn) {
    test('Check real CDN URL signing', function checkEncode() {
      cases.forEach(function checkTestCase(info, idx) {
        assert.equal(cdn.urlSignature(info.encoded, info.format), info.signature,
           'The signature of the url ' + idx + ' (' + info.url + ') didn\'t match');
      });
    });

    test('Check real CDN URL', function checkSignatures() {
      cases.forEach(function checkTestCase(info, idx) {
        assert.equal(cdn.imageUrl(info.url, info.format), info.cdnUrl,
           'CDN URL for url ' + idx + ' (' + info.url + ') didn\'t match');
      });
    });
  }

  test('Check re-salted CDN URL signing', function checkEncode() {
    cases.forEach(function checkTestCase(info, idx) {
      assert.equal(reCdn.urlSignature(info.encoded, info.format), info.resaltedSignature,
         'The signature of the url ' + idx + ' (' + info.url + ') didn\'t match');
    });
  });

  test('Check re-salted CDN URL', function checkSignatures() {
    cases.forEach(function checkTestCase(info, idx) {
      assert.equal(reCdn.imageUrl(info.url, info.format), info.resaltedCdnUrl,
         'CDN URL for url ' + idx + ' (' + info.url + ') didn\'t match');
    });
  });

});
