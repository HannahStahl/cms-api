import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function main(event, context) {
  const userId = event.requestContext.identity.cognitoIdentityId;
  const data = JSON.parse(event.body);
  const { itemId, selectedIds, attributeType } = data;
  try {
    // Add any new attribute values that were created
    const tableName = process.env[`${attributeType}TableName`];
    const joiningTableName = process.env[`itemTo${capitalize(attributeType)}TableName`];
    const result = await dynamoDbLib.call("query", {
      TableName: tableName,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: { ":userId": userId }
    });
    const existingIds = result.Items.map(row => row[`${attributeType}Id`]);
    let promises = [];
    selectedIds.forEach((id, index) => {
      if (!existingIds.includes(id)) {
        const newAttribute = { userId, createdAt: Date.now() };
        newAttribute[`${attributeType}Id`] = uuid.v1();
        newAttribute[`${attributeType}Name`] = id;
        selectedIds[index] = newAttribute[`${attributeType}Id`];
        promises.push(dynamoDbLib.call("put", {
          TableName: tableName, Item: newAttribute,
        }));
      }
    });

    // Delete any removed relationships to this item
    const result2 = await dynamoDbLib.call("query", {
      TableName: joiningTableName,
      KeyConditionExpression: "userId = :userId",
      FilterExpression: "itemId = :itemId",
      ExpressionAttributeValues: { ":userId": userId, ":itemId": itemId }
    });
    const existingRelationships = result2.Items;
    existingRelationships.forEach((relationship) => {
      if (!selectedIds.includes(relationship[`${attributeType}Id`])) {
        const key = { userId };
        key[`itemTo${capitalize(attributeType)}Id`] = relationship[`itemTo${capitalize(attributeType)}Id`];
        promises.push(dynamoDbLib.call("delete", {
          TableName: joiningTableName,
          Key: key,
        }));
      }
    });

    // Add any new relationships to this item
    const existingIdsForItem = existingRelationships.map(relationship => relationship[`${attributeType}Id`]);
    selectedIds.forEach((id, index) => {
      if (!existingIdsForItem.includes(id)) {
        promises.push(dynamoDbLib.call("put", {
          TableName: joiningTableName,
          Item: {
            [`itemTo${capitalize(attributeType)}Id`]: uuid.v1(),
            userId,
            itemId,
            [`${attributeType}Id`]: id,
            [`itemTo${capitalize(attributeType)}Rank`]: index,
            createdAt: Date.now(),
          },
        }));
      } else {
        const existingRelationship = existingRelationships.find(relationship => relationship[`${attributeType}Id`] === id);
        promises.push(dynamoDbLib.call("update", {
          TableName: joiningTableName,
          Key: { userId, [`itemTo${capitalize(attributeType)}Id`]: existingRelationship[`itemTo${capitalize(attributeType)}Id`] },
          UpdateExpression: `SET itemId = :itemId, ${attributeType}Id = :${attributeType}Id, itemTo${capitalize(attributeType)}Rank = :itemTo${capitalize(attributeType)}Rank`,
          ExpressionAttributeValues: {
            ":itemId": itemId,
            [`:${attributeType}Id`]: id,
            [`:itemTo${capitalize(attributeType)}Rank`]: index
          },
          ReturnValues: "ALL_NEW"
        }));
      }
    });
    await Promise.all(promises);

    // Delete any no-longer-used attribute values
    const [result3, result4] = await Promise.all([
      dynamoDbLib.call("query", {
        TableName: tableName,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: { ":userId": userId }
      }),
      dynamoDbLib.call("query", {
        TableName: joiningTableName,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: { ":userId": userId }
      }),
    ]);
    const attributes = result3.Items;
    const usedIds = result4.Items.map(relationship => relationship[`${attributeType}Id`]);
    const idsToRemove = attributes.map(attribute => attribute[`${attributeType}Id`]).filter(id => !usedIds.includes(id));
    promises = [];
    idsToRemove.forEach((id) => {
      const key = { userId };
      key[`${attributeType}Id`] = id;
      promises.push(dynamoDbLib.call("delete", {
        TableName: tableName,
        Key: key,
      }));
    });
    await Promise.all(promises);

    return success({ status: true });
  } catch (error) {
    return failure({ status: false, error });
  }
}
