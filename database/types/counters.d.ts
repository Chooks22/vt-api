type Document = import('mongoose').Document;

interface CounterProps extends Document {
  _id: string;
  index: number;
}
