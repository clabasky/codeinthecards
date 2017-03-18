# codeinthecards


Code in the cards is a super simple way to create coded messages. 

The arrangement of the deck of cards is used as the secret key that encodes the messages using AES-256. The arrangement is then hashed, and the hashed deck arrangement and cipher text is stored in a noSQL database (DynamoDB).

Any number of cards can be used, but the message becomes increasingly secure as the card arrangement becomes longer.

The total number of possibilities for deck arrangements is (52! + 51! + ... + 2! + 1!)/2 = 4.1120e+67 (the /2 for the number of deck arrangements occurs because we look at the deck arrangement both forwards and backwards).


Back end implementation: 

We use 2 AWS lambda functions (lambda/saveDeckMessage.js and lambda/getDeckMessage.js) to do the encryption and saves and database lookups. AWS API Gateway is used to route requests, and DynamoDB is used as the database. 


TODOs: add the option to include a password in the hashing/encryption process to provide a more secure option
