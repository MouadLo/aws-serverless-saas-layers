// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

'use strict';

const logManager = require('./Utils/log-manager.js');
const helper = require('./Utils/helper.js');
const doc = require('dynamodb-doc');
const dynamodb = new doc.DynamoDB();

const tableName = "Order";
const tableDefinition = {
    AttributeDefinitions: [ 
    {
      AttributeName: "OrderId", 
      AttributeType: "S"
    } ], 
    KeySchema: [ 
    {
      AttributeName: "OrderId", 
      KeyType: "HASH"
    } ], 
    ProvisionedThroughput: {
     ReadCapacityUnits: 5, 
     WriteCapacityUnits: 5
    }, 
    TableName: tableName
};

// Get an order from DynamoDB
module.exports.getOrder = function(event, callback) {
    logManager.log("OrderManager", { "Message": "DAL GetOrder() called.", "OrderId" : event.pathParameters.resourceId});

    const params = {
        "TableName": tableName,
        "Key": {
            OrderId: event.pathParameters.resourceId
        }
    };

    dynamodb.getItem(params, (err, data) => {
        let response;
        if (err)
            response = createResponse(500, err);
        else
            response = createResponse(200, data.Item ? data.Item.doc : null);

        callback(response);
    });    
};

// Add or update an order to DynamoDB 
module.exports.updateOrder = (event, callback) => {
    logManager.log("OrderManager", {"Message": "DAL UpdateOrder() called.", "OrderId" : event.pathParameters.resourceId});

    helper.createTable(tableDefinition, function() {
        const item = {
            "OrderId": event.pathParameters.resourceId,
            "doc": event.body
        };

        const params = {
            "TableName": tableName,
            "Item": item
        };

        dynamodb.putItem(params, (err) => {
            let response;
            if (err)
                response = createResponse(500, err);
            else
                response = createResponse(200, null);
            
            callback(response);
        });
    
    });
};

// delete an order from DynamoDB 
module.exports.deleteOrder = (event, callback) => {
    logManager.log("OrderManager", {"Message": "DAL deleteOrder() called.", "OrderId" : event.pathParameters.resourceId});

    const params = {
        "TableName": tableName,
        "Key": {
            "OrderId": event.pathParameters.resourceId
        }
    };

    dynamodb.deleteItem(params, (err) => {
        let response;
        if (err)
            response = createResponse(500, err);
        else
            response = createResponse(200, null);

        callback(response);
    });
    
};

const createResponse = (statusCode, body) => {
    return {
        "statusCode": statusCode,
        "body": body || ""
    }
};

