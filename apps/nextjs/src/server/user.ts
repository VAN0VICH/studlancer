"server-only";

import { cache } from "react";

export const userByUsername = cache(
  async ({ username }: { username: string }) => {
  
    try {
   
      return null;
    } catch (error) {
      console.log(error);
      throw new Error("Failed to retrieve user");
    }
  }
);
// export const userComponent = async ({ id }: { id: string }) => {
//   const params: GetCommandInput = {
//     TableName: env.MAIN_TABLE_NAME,

//     Key: { PK: userKey(id), SK: userKey(id) },
//     ProjectionExpression: "#id, #username, #level, #profile, #verified",
//     ExpressionAttributeNames: {
//       "#id": "id",
//       "#username": "username",
//       "#level": "level",
//       "#profile": "profile",
//       "#verified": "verified",
//     },
//   };
//   try {
//     const result = await dynamoClient.send(new GetCommand(params));
//     if (result.Item) {
//       const userComponent = result.Item as UserComponent;
//       return userComponent;
//     }
//     return null;
//   } catch (error) {
//     console.log(error);
//     throw new Error("failed to retrieve user");
//   }
// };
