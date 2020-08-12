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
    UpdateExpression: "SET itemName = :itemName, itemSubtitle = :itemSubtitle, itemDescription = :itemDescription, itemPrice = :itemPrice, itemSalePrice = :itemSalePrice, itemOnSale = :itemOnSale, itemPublished = :itemPublished, datePublished = :datePublished, itemRank = :itemRank, itemLink = :itemLink, itemHtml = :itemHtml, itemPdf = :itemPdf, categoryId = :categoryId, cmsPageConfigId = :cmsPageConfigId, updatedAt = :updatedAt",
    ExpressionAttributeValues: {
      ":itemName": data.itemName || null,
      ":itemSubtitle": data.itemSubtitle || null,
      ":itemDescription": data.itemDescription || null,
      ":itemPrice": data.itemPrice || null,
      ":itemSalePrice": data.itemSalePrice || null,
      ":itemOnSale": data.itemOnSale || null,
      ":itemPublished": data.itemPublished || null,
      ":datePublished": data.datePublished || null,
      ":itemRank": data.itemRank || null,
      ":itemLink": data.itemLink || null,
      ":itemHtml": data.itemHtml || null,
      ":itemPdf": data.itemPdf || null,
      ":categoryId": data.categoryId || null,
      ":cmsPageConfigId": data.cmsPageConfigId || null,
      ":updatedAt": Date.now()
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
