/* jshint node: true */
'use strict';

var lib = {
  crypto: require('crypto'),
  url: require('url'),
  crc32: require('buffer-crc32')
};

function Cdn(options) {
  options = options || {};
  this.schema = options.noSsl ? 'http:' : 'https:';

  this.salt = options.salt || null;
  if (typeof this.salt === 'string') {
    this.salt = new Buffer(this.salt, 'hex');
  }

  this.hosts = options.hosts || [
    'cdn1.blovcdn.com',
    'cdn2.blovcdn.com',
    'cdn3.blovcdn.com'
  ];
}
module.exports = Cdn;

/**
 * Decodes a CDN url and returns the underlying url. Returns the url unchanged if it
 * is not identified as a CDN url.
 * @param {string} url A CDN url
 */
Cdn.prototype.realUrl = function(url) {
  var p = lib.url.parse(url);
  if (this.hosts.indexOf(p.hostname) !== -1) {
    var s = p.pathname.split('/');
    if (s.length === 5) {
      var enc = new Buffer(s[4], 'base64').toString('utf8');
      return decodeURIComponent(enc);
    }
  }
  return url;
};

Cdn.prototype.imageUrl = function (url, size) {
  size = size || 's';

  // Requests for BDB-CDN
  // http://<host>/bloglovin/<checksum>/<size>/<base64url>
  //
  // I heard you like urls so we sha1:ed your base64 of your urlencode of your url
  // .... and put it in your URL.
  var encodedUrl = this.encodeUrl(url);
  var digest = this.urlSignature(encodedUrl, size);
  var host = this.getHost(encodedUrl);
  var cdnUrl = this.schema + '//' + host + '/bloglovin/' + digest + '/' + size + '/' + encodedUrl;

  return cdnUrl;
};

Cdn.prototype.urlSignature = function (encodedUrl, size) {
  var hash = lib.crypto.createHash('sha1');
  hash.update(encodedUrl + size, 'utf8');
  if (this.salt) {
    hash.update(this.salt);
  }
  return hash.digest('hex');
};

Cdn.prototype.encodeUrl = function (url) {
  return new Buffer(this.phpUrlencode(url)).toString('base64');
};

Cdn.prototype.getHost = function (encodedUrl) {
  var checksum = lib.crc32.unsigned(encodedUrl);
  var index = checksum % this.hosts.length;

  return this.hosts[index];
};

Cdn.prototype.phpUrlencode = function urlencode(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/~/g, '%7E')
    .replace(/%20/g, '+');
};
