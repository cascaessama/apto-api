import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

interface IAluno extends mongoose.Document {
  nome: string;
  senha: string;
}

const alunoSchema = new mongoose.Schema<IAluno>({
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
alunoSchema.pre('save', async function(next) {
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

export const Aluno = mongoose.model<IAluno>('Aluno', alunoSchema);
