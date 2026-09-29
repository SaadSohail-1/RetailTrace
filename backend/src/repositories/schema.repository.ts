import { SchemaModel, type SchemaModelType } from "../models/index.js";

type NewSchema = Omit<SchemaModelType, "createdAt" | "updatedAt">;
type SchemaUpdate = Partial<NewSchema>;

export class SchemaRepository {
    create(input: NewSchema) {
        return SchemaModel.create(input);
    }

    findById(id: string) {
        return SchemaModel.findById(id).exec();
    }

    findByIdAndBusinessId(schemaId: string, businessId: string) {
        return SchemaModel.findOne({ _id: schemaId, businessId }).exec();
    }

    findByBusinessId(businessId: string) {
        return SchemaModel.find({ businessId }).sort({ name: 1, version: -1 }).exec();
    }

    findByBusinessAndName(businessId: string, name: string) {
        return SchemaModel.findOne({ businessId, name })
            .sort({ version: -1 })
            .exec();
    }

    findByBusinessNameAndVersion(
        businessId: string,
        name: string,
        version: number
    ) {
        return SchemaModel.findOne({ businessId, name, version }).exec();
    }

    updateById(id: string, changes: SchemaUpdate) {
        return SchemaModel.findByIdAndUpdate(id, changes, {
            returnDocument: "after",
            runValidators: true
        }).exec();
    }

    deleteById(id: string) {
        return SchemaModel.findByIdAndDelete(id).exec();
    }
}

export const schemaRepository = new SchemaRepository();