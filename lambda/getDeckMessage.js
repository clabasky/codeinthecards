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
  

exports.getDeckMessage = (event, context, callback) => {
    console.log(JSON.stringify(event));
    var data = event.queryStringParameters;
    var deck = JSON.parse(data.deck);
    
    var reverseDeck = [];
    for(var x = (deck.length - 1); x > -1; x--){
        reverseDeck.push(deck[x]);
    }
    
    var password = data.password;
   
    
    var deckIndex = cards.indexOf(deck[0]);
    var revDeckIndex = cards.indexOf(reverseDeck[0]);
    
    var uniqueDeck = (deckIndex < revDeckIndex) ? deck.concat(reverseDeck) : reverseDeck.concat(deck);
    var deckStr = uniqueDeck.join(',');
    var deckKey = crypto.createHash('md5').update(deckStr).digest('hex');
    
    
    var getObj = {
        TableName: 'deck-message',
        Key: {
            deck_key: {S: deckKey}
        }
    };
    
    db.getItem(getObj, function(err, res){
        if(err){
            console.log(err);
            context.fail('error searching DB');
        }
        else{
            console.log(JSON.stringify(res));
            if(res.Item){
                
                var cleanMessage = decrypt(res.Item.message.S, deckStr)
                var output = {
                    "statusCode": 200,
                    "headers": { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                    "body": JSON.stringify({success:true, message:cleanMessage})
                };
                context.succeed(output);
            }
            else{
                var output = {
                    "statusCode": 200,
                    "headers": { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
                    "body": JSON.stringify({success:false, message:"That deck arrangement does not exist :("})
                };
                context.succeed(output);
            }
        }
    })
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
