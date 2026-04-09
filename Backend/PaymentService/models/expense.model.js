import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
    {
        landlordId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Property',
            required: true
        },
        title: {
            type: String,
            required: true // e.g., "Fixing leaking kitchen pipe"
        },
        amount: {
            type: Number,
            required: true
        },
        category: {
            type: String,
            enum: ['maintenance', 'repair', 'tax', 'insurance', 'utility', 'other'],
            default: 'other'
        },
        date: {
            type: Date,
            required: true,
            default: Date.now
        },
        description: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
);

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;