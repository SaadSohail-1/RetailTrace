import {
    BusinessIdentityModel,
    type BusinessIdentityModelType
} from "../models/index.js";

type NewBusinessIdentity = Omit<
    BusinessIdentityModelType,
    "createdAt" | "updatedAt"
>;
type BusinessIdentityUpdate = Partial<NewBusinessIdentity>;

export class BusinessIdentityRepository {
    create(input: NewBusinessIdentity) {
        return BusinessIdentityModel.create(input);
    }

    findByBusinessId(businessId: string) {
        return BusinessIdentityModel.findOne({ businessId }).exec();
    }

    findByBlockchainAddress(blockchainAddress: string) {
        return BusinessIdentityModel.findOne({ blockchainAddress }).exec();
    }

    updateByBusinessId(businessId: string, changes: BusinessIdentityUpdate) {
        return BusinessIdentityModel.findOneAndUpdate(
            { businessId },
            changes,
            { returnDocument: "after", runValidators: true }
        ).exec();
    }

    deleteByBusinessId(businessId: string) {
        return BusinessIdentityModel.findOneAndDelete({ businessId }).exec();
    }
}

export const businessIdentityRepository = new BusinessIdentityRepository();