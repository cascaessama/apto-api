import mongoose from 'mongoose';

interface IAvaliacao extends mongoose.Document {
  nome: string;
  descricao: string;
  dataAvaliacao: Date;
  idCurso: mongoose.Types.ObjectId;
}

const avaliacaoSchema = new mongoose.Schema<IAvaliacao>({
  nome: {
    type: String,
    required: true,
    unique: true
  },
  descricao: {
    type: String,
    required: true,
    maxlength: 500
  },
  dataAvaliacao: {
    type: Date,
    required: true
  },
  idCurso: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Curso',
    required: true
  }
}, {
  timestamps: true
});

export const Avaliacao = mongoose.model<IAvaliacao>('Avaliacao', avaliacaoSchema);
