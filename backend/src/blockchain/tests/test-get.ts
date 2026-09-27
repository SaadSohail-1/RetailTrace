import { getRecord } from "../record.service.js";

const RECORD_ID = "P1001";
const record = await getRecord(RECORD_ID);

console.log(record);