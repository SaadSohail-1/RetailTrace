import { getRecordHistory } from "../record.service.js";

const RECORD_ID = "P1001"
const history = await getRecordHistory(RECORD_ID);

console.log(`Record History for ${RECORD_ID}:`, history);