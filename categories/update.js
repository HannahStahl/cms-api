import * as dynamoDbLib from "../libs/dynamodb-lib";
import { success, failure } from "../libs/response-lib";

export async function main(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.categoryTableName,
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      categoryId: event.pathParameters.id
    },
    UpdateExpression: "SET categoryName = :categoryName, categoryPhoto = :categoryPhoto, categoryRank = :categoryRank, categoryPublished = :categoryPublished",
    ExpressionAttributeValues: {
      ":categoryName": data.categoryName || null,
      ":categoryPhoto": data.categoryPhoto || null,
      ":categoryRank": data.categoryRank || null,
      ":categoryPublished": data.categoryPublished || null,
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
