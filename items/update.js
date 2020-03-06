import * as dynamoDbLib from "../libs/dynamodb-lib";
import { success, failure } from "../libs/response-lib";

export async function main(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.itemTableName,
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      itemId: event.pathParameters.id
    },
    UpdateExpression: "SET itemName = :itemName, itemDescription = :itemDescription, itemPrice = :itemPrice, itemSalePrice = :itemSalePrice, itemOnSale = :itemOnSale, itemPublished = :itemPublished, itemRank = :itemRank, categoryId = :categoryId",
    ExpressionAttributeValues: {
      ":itemName": data.itemName || null,
      ":itemDescription": data.itemDescription || null,
      ":itemPrice": data.itemPrice || null,
      ":itemSalePrice": data.itemSalePrice || null,
      ":itemOnSale": data.itemOnSale || null,
      ":itemPublished": data.itemPublished || null,
      ":itemRank": data.itemRank || null,
      ":categoryId": data.categoryId || null,
    },
    ReturnValues: "ALL_NEW"
  };

  try {
    await dynamoDbLib.call("update", params);
    return success({ status: true });
  } catch (error) {
    return failure({ status: false, error });
  }
}
