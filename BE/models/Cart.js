import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductData' },
      quantity: { type: Number, required: true }
    }
  ]
});

export default mongoose.model('Cart', cartSchema);