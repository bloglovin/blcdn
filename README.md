# Bloglovin' CDN client

Bloglovin' CDN client for generated signed urls for use with blovcdn.com.

## Usage

```javascript
var lib = {
  Cdn: require('blcdn')
};

var cdn = new lib.Cdn({
  salt: 'b73ec4880853451fb28dea450abcb520', // Yes, totally fake & made up
  hosts: [
    "cdn1.blovcdn.com",
    "cdn2.blovcdn.com",
    "cdn3.blovcdn.com"
  ]
});

// Generate a signed cdn url in the format 's' for the image.
var cdnUrl = cdn.imageUrl('http://example.com/some-image.jpg', 's');
```

## Tests

Tests are run through `npm test`. The raw test URLs (URLs that are generated with the PHP lib that we need to conform to) are stored in `test/cdn.json`. If this file is modified the test cases must be updated through running `./bin/update-test-cases`. This will generate a random salt and update `test/cases.json` with the URLs signed with the new salt. This is necessary for running the tests without knowing the real salt.

To run the tests with the proper salt you need to export the salt as the environment variable `CDN_SALT`, like so:

```bash
export CDN_SALT="b73ec4880853451fb28dea450abcb520"
```

The salt is expected to be a hex encoded string.
