import { createBusinessIdentity } from "../identitiy.service.js";

const address = await createBusinessIdentity();

console.log("Business Blockchain identity:", address);