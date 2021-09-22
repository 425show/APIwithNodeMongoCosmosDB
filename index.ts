import {
    AzureCliCredential,
    ChainedTokenCredential,
    ManagedIdentityCredential
} from "@azure/identity";
import {ObjectId} from 'mongodb';
import {MongoClient, Document} from 'mongodb';
import express from 'express';
import { SecretClient} from "@azure/keyvault-secrets";

const keyVaultEndpoint = "https://cm-kv-demo.vault.azure.net/";
const credential = new ChainedTokenCredential(
    new AzureCliCredential(),
    new ManagedIdentityCredential()
    );
    const app = express();
    
const cosmosDBConnectionString = await getClientSecretFromKV();
const SERVER_PORT = process.env.PORT || 8000;
app.listen(SERVER_PORT, () => console.log(`Node.js API with MongoDB and CosmosDB listening on port ${SERVER_PORT}!`));

const insertDocument = function(db, callback) {
    db.collection('families').insertOne( {
            "id": "AndersenFamily",
            "lastName": "Andersen",
            "parents": [
                { "firstName": "Thomas" },
                { "firstName": "Mary Kay" }
            ],
            "children": [
                { "firstName": "John", "gender": "male", "grade": 7 }
            ],
            "pets": [
                { "givenName": "Fluffy" }
            ],
            "address": { "country": "USA", "state": "WA", "city": "Seattle" }
        }, function(err, result) {
        console.log("Inserted a document into the families collection.");
        callback();
    });
};

async function getClientSecretFromKV() {
    const client = new SecretClient(keyVaultEndpoint, credential);
    return await client.getSecret("cosmos-mongo-connectionurl");
};

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/families', (req, res) => {
    var data: Array<Document> = [];
    MongoClient.connect(cosmosDBConnectionString.value, function(err, client) {
        let db = client.db('familiesdb');
        db.collection('families').find({}).toArray(function(err, docs) {
            console.log("Found the following records");
            console.log(docs);
            data = docs;
            client.close();
        });
    });
    res.send(data);
});

app.get('/insert', (req, res) => {
    MongoClient.connect(cosmosDBConnectionString.value, function(err, client) {
        let db = client.db('familiesdb');
        insertDocument(db, function() {
            client.close();
        });
    });
    res.send('Inserted a document into the families collection.');
});

app.get('/delete', (req, res) => {
    let lastname = req.query.lastname;
    MongoClient.connect(cosmosDBConnectionString.value, function(err, client) {
        let db = client.db('familiesdb');
        db.collection('families').deleteOne({ lastName: lastname }, function(err, result) {
            console.log("Deleted the document with the last name " + lastname);
            client.close();
        });
    res.send('Deleted the document(s) with last name ' + lastname);
    });
});
