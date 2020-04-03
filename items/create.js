import uuid from "uuid";
import * as dynamoDbLib from "../libs/dynamodb-lib";
import { success, failure } from "../libs/response-lib";

export async function main(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.itemTableName,
    Item: {
      userId: event.requestContext.identity.cognitoIdentityId,
      itemId: uuid.v1(),
      itemName: data.itemName,
      itemDescription: data.itemDescription,
      itemPrice: data.itemPrice,
      itemSalePrice: data.itemSalePrice,
      itemOnSale: data.itemOnSale,
      itemPublished: data.itemPublished,
      itemRank: data.itemRank,
      itemLink: data.itemLink,
      itemHtml: data.itemHtml,
      categoryId: data.categoryId,
      cmsPageConfigId: data.cmsPageConfigId,
      createdAt: Date.now()
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    return success(params.Item);
  } catch (error) {
    return failure({ status: false, error });
  }
}
