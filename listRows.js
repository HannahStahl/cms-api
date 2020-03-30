import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function listRows(event, tableName, attributeType) {
  const params = {
    TableName: tableName,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": event.requestContext.identity.cognitoIdentityId
    }
  };
  if (event.pathParameters && event.pathParameters.cmsPageConfigId) {
    params.FilterExpression = "cmsPageConfigId = :cmsPageConfigId";
    params.ExpressionAttributeValues[":cmsPageConfigId"] = event.pathParameters.cmsPageConfigId;
  }

  try {
    const result = await dynamoDbLib.call("query", params);
    const sortedRows = result.Items.sort((a, b) => a[`${attributeType}Rank`] - b[`${attributeType}Rank`]);
    return success(sortedRows);
  } catch (error) {
    return failure({ status: false, error });
  }
}
