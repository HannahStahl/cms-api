import { listRows } from "../listRows";

export async function main(event, context) {
  return listRows(event, process.env.categoryTableName, "category");
}
