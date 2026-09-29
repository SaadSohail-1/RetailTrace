import {
    BusinessModel,
    type BusinessModelType
} from "../models/index.js";

type NewBusiness = Omit<BusinessModelType, "createdAt" | "updatedAt">;
type BusinessUpdate = Partial<NewBusiness>;

export class BusinessRepository {
    create(input: NewBusiness) {
        return BusinessModel.create(input);
    }

    findById(id: string) {
        return BusinessModel.findById(id).exec();
    }

    findByEmail(email: string) {
        return BusinessModel.findOne({ email }).exec();
    }

    findByApiKeyHash(apiKeyHash: string) {
        return BusinessModel.findOne({ apiKeyHash }).exec();
    }

    updateById(id: string, changes: BusinessUpdate) {
        return BusinessModel.findByIdAndUpdate(id, changes, {
            returnDocument: "after",
            runValidators: true
        }).exec();
    }

    deleteById(id: string) {
        return BusinessModel.findByIdAndDelete(id).exec();
    }
}

export const businessRepository = new BusinessRepository();