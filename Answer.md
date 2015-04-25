1. Use either HTTP status codes or codes within a json object, currently both are being used.
2. Use a more secure hashing algorithm instead of sha1, such as bcrypt or PBKDF2.
3. Use a system more similar to OAuth2, conform [RFC6749](https://tools.ietf.org/html/rfc6749)