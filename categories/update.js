import * as dynamoDbLib from "../libs/dynamodb-lib";
import { success, failure } from "../libs/response-lib";

export async function main(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.itemCategoryTableName,
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      categoryId: event.pathParameters.id
    },
    UpdateExpression: "SET categoryName = :categoryName, categoryPhoto = :categoryPhoto, categoryRank = :categoryRank, categoryPublished = :categoryPublished, cmsPageConfigId = :cmsPageConfigId",
    ExpressionAttributeValues: {
      ":categoryName": data.categoryName || null,
      ":categoryPhoto": data.categoryPhoto || null,
      ":categoryRank": data.categoryRank,
      ":categoryPublished": data.categoryPublished || null,
      ":cmsPageConfigId": data.cmsPageConfigId || null,
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
