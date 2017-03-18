crypto = require('crypto');

aws = require('aws-sdk');
db = new aws.DynamoDB();

var cards = [
    "ac","ad","ah","as",
    "2c","2d","2h","2s",
    "3c","3d","3h","3s",
    "4c","4d","4h","4s",
    "5c","5d","5h","5s",
    "6c","6d","6h","6s",
    "7c","7d","7h","7s",
    "8c","8d","8h","8s",
    "9c","9d","9h","9s",
    "tc","td","th","ts",
    "jc","jd","jh","js",
    "qc","qd","qh","qs",
    "kc","kd","kh","ks"
];
    
    
exports.saveDeckMessage = (event, context, callback) => {
    
    var body = JSON.parse(event.body);
    var deck = body.deck;
    var message = body.message;
    var password = body.password;
    
    if(2000 < message.length){
        output.body = JSON.stringify({success:false, message: "Your message is too long, keep it under 2,000 characters"});
        context.succeed(output);
        return;
    }
    
    var reverseDeck = [];
    for(var x = (deck.length - 1); x > -1; x--){
        reverseDeck.push(deck[x]);
    }
    
    
    var deckIndex = cards.indexOf(deck[0]);
    var revDeckIndex = cards.indexOf(reverseDeck[0]);
    
    var uniqueDeck = (deckIndex < revDeckIndex) ? deck.concat(reverseDeck) : reverseDeck.concat(deck);
    var deckStr = uniqueDeck.join(',');
    var deckKey = crypto.createHash('md5').update(deckStr).digest('hex');
    var encryptedMessage = encrypt(message, deckStr);
    
    var getObj = {
        TableName: 'deck-message',
        Key: {
            deck_key: {S: deckKey}
        }
    };
    
    db.getItem(getObj, function(err, res){
        if(err) context.fail('error searching DB');
        else{
            if(res.Item){
                
                output.body = JSON.stringify({success:false,message:'That deck arrangement already exists... try a different arrangement, or click "View secret message"'});
                context.succeed(output);
            }
            else{
                var putObj = {
                    TableName: 'deck-message',
                    Item: {
                        deck_key: {S: deckKey},
                        message: {S: encryptedMessage},
                        created_timestamp: {S: new Date().getTime().toString()}
                    }
                };
                db.putItem(putObj, function(err, res){
                    if(err) context.fail('error adding item to DB');
                    else{
                       
                        output.body = JSON.stringify({success:true, message:'Successfully created secret message!!!'});
                        context.succeed(output);
                    }
                })
            }
        }
    })
};



var output = {
    "statusCode": 200,
    "headers": { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    "body": null
};





function encrypt(text, password){
  var cipher = crypto.createCipher('aes-256-ctr',password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
 
function decrypt(text, password){
  var decipher = crypto.createDecipher('aes-256-ctr',password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}
 

