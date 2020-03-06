import * as dynamoDbLib from "../libs/dynamodb-lib";
import { success, failure } from "../libs/response-lib";

export async function main(event, context) {
  const params = {
    TableName: process.env.itemCategoryTableName,
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      categoryId: event.pathParameters.id
    }
  };

  try {
    await dynamoDbLib.call("delete", params);
    return success({ status: true });
  } catch (error) {
    return failure({ status: false, error });
  }
}
