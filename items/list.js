import * as dynamoDbLib from "../libs/dynamodb-lib";
import { success, failure } from "../libs/response-lib";

export async function main(event, context) {
  const params = {
    TableName: process.env.itemTableName,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": event.requestContext.identity.cognitoIdentityId
    }
  };
  if (event.pathParameters && event.pathParameters.id) {
    params.FilterExpression = "categoryId = :categoryId";
    params.ExpressionAttributeValues[":categoryId"] = event.pathParameters.id;
  }

  try {
    const result = await dynamoDbLib.call("query", params);
    const sortedItems = result.Items.sort((a, b) => a.itemRank - b.itemRank);
    return success(sortedItems);
  } catch (error) {
    return failure({ status: false, error });
  }
}