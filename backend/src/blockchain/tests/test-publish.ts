import { env } from "../../config/env.js";
import { publishRecord } from "../record.service.js";

const FROM_ADDRESS = env.MULTICHAIN_ADDRESS!;

const result = await publishRecord(
    {
        recordId: "P1001",
        businessId: "B1001",
        schemaId: "SCHEMA001",
        data: {
            productId: "P1001",
            name: "Laptop X",
            price: 250000
        }
    },
    FROM_ADDRESS
);

console.log("Published:", result);


