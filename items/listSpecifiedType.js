import * as dynamoDbLib from "../libs/dynamodb-lib";
import { success, failure } from "../libs/response-lib";

export async function main(event, context) {
  const params = {
    TableName: process.env.itemTableName,
    KeyConditionExpression: "userId = :userId",
    FilterExpression: "cmsPageConfigId = :cmsPageConfigId",
    ExpressionAttributeValues: {
      ":userId": event.requestContext.identity.cognitoIdentityId,
      ":cmsPageConfigId": event.pathParameters.cmsPageConfigId
    }
  };

  try {
    const result = await dynamoDbLib.call("query", params);
    const sortedItems = result.Items.sort((a, b) => a.itemRank - b.itemRank);
    return success(sortedItems);
  } catch (error) {
    return failure({ status: false, error });
  }
}