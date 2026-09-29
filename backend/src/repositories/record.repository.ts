import { RecordModel, type RecordModelType } from "../models/index.js";

type NewRecord = Omit<RecordModelType, "createdAt" | "updatedAt">;
type RecordUpdate = Partial<NewRecord>;

export class RecordRepository {
    create(input: NewRecord) {
        return RecordModel.create(input);
    }

    findById(id: string) {
        return RecordModel.findById(id).exec();
    }

    findByBusinessId(businessId: string) {
        return RecordModel.find({ businessId }).sort({ createdAt: -1 }).exec();
    }

    findByBusinessAndSchema(businessId: string, schemaId: string) {
        return RecordModel.find({ businessId, schemaId })
            .sort({ createdAt: -1 })
            .exec();
    }

    findByTransactionId(transactionId: string) {
        return RecordModel.findOne({ transactionId }).exec();
    }

    updateTransaction(id: string, transactionId: string) {
        return RecordModel.findByIdAndUpdate(
            id,
            { transactionId },
            { returnDocument: "after", runValidators: true }
        ).exec();
    }

    updateStatus(id: string, status: RecordModelType["status"]) {
        return RecordModel.findByIdAndUpdate(
            id,
            { status },
            { returnDocument: "after", runValidators: true }
        ).exec();
    }

    updateById(id: string, changes: RecordUpdate) {
        return RecordModel.findByIdAndUpdate(id, changes, {
            returnDocument: "after",
            runValidators: true
        }).exec();
    }

    deleteById(id: string) {
        return RecordModel.findByIdAndDelete(id).exec();
    }
}

export const recordRepository = new RecordRepository();