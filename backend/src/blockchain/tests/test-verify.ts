import { verifyRecord } from "../record.service.js";

const RECORD_ID = "P1001"
const verification = await verifyRecord(RECORD_ID);

console.log("Verification:", verification);