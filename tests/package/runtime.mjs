import { OAuth1Client, YahooFantasyClient } from 'yfs-api';

if (typeof YahooFantasyClient !== 'function')
   throw new Error('Client export missing.');

const signed = new OAuth1Client(
   'consumer-key',
   'consumer-secret',
).signRequest('GET', 'https://example.com/resource?format=json');
const url = new URL(signed);
if (!url.searchParams.get('oauth_signature'))
   throw new Error('OAuth1 signing failed.');

console.log('Native package import and OAuth1 signing passed.');
