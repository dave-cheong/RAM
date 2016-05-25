import * as mongoose from 'mongoose';
/* A RAMObject defines the common attributes that all objects in the RAM
 * model will contain.
 * Most objects in RAM extend off the RAMObject
 */
export interface IRAMObject extends mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
  deleteInd: boolean;
  resourceVersion: string;

  /** Instance methods */
  delete(): void;
}

export const RAMSchema = (schema: Object) => {

  const result = new mongoose.Schema({
    deleteInd: { type: Boolean, default: false },
    resourceVersion: { type: String, default: '1' }
  }, { timestamps: true });

  result.add(schema);

  result.method('delete', function() {
      this.deleteInd = true;
      this.save();
  });

  return result;

};