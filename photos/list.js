import { listRows } from "../listRows";

export async function main(event, context) {
  return listRows(process.env.photoTableName, "photo");
}
