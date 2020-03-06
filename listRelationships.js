import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function listRelationships(event, tableName, attributeType) {
  const params = {
    TableName: tableName,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": event.requestContext.identity.cognitoIdentityId
    }
  };
  if (event.pathParameters && event.pathParameters.id) {
    params.FilterExpression = "itemId = :itemId";
    params.ExpressionAttributeValues[":itemId"] = event.pathParameters.id;
  }

  try {
    const result = await dynamoDbLib.call("query", params);
    const sortedRows = result.Items.sort((a, b) => a[`itemTo${attributeType}Rank`] - b[`itemTo${attributeType}Rank`]);
    return success(sortedRows);
  } catch (error) {
    return failure({ status: false, error });
  }
}
