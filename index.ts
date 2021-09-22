import {
    AzureCliCredential,
    ChainedTokenCredential,
    ManagedIdentityCredential
} from "@azure/identity";

import express = require("express");

const app = express();

const SERVER_PORT = process.env.PORT || 8000;
app.listen(SERVER_PORT, () => console.log(`Node.js API with MongoDB and CosmosDB listening on port ${SERVER_PORT}!`))