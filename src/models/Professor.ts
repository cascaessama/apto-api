import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

interface IProfessor extends mongoose.Document {
  nome: string;
  senha: string;
}

const professorSchema = new mongoose.Schema<IProfessor>({
  nome: {
    type: String,
    required: true,
    unique: true
  },
  senha: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Hash de senha antes de salvar
professorSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) {
    return next();
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    this.senha = await bcryptjs.hash(this.senha, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

export const Professor = mongoose.model<IProfessor>('Professor', professorSchema);
