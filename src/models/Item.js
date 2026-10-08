import mongoose from 'mongoose';

// A schema describes the data you want to store.
const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
});

const Item = mongoose.model('Item', itemSchema);

export default Item;
