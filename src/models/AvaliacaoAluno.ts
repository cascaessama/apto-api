import mongoose from 'mongoose';

interface IAvaliacaoAluno extends mongoose.Document {
  observacoes: string;
  nota: number;
  idAvaliacao: mongoose.Types.ObjectId;
  idAluno: mongoose.Types.ObjectId;
}

const avaliacaoAlunoSchema = new mongoose.Schema<IAvaliacaoAluno>({
  observacoes: {
    type: String,
    default: null
  },
  nota: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  idAvaliacao: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Avaliacao',
    required: true
  },
  idAluno: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Aluno',
    required: true
  }
}, {
  timestamps: true
});

// Índice composto para evitar duplicatas (um aluno não pode ter duas avaliações da mesma avaliação)
avaliacaoAlunoSchema.index({ idAvaliacao: 1, idAluno: 1 }, { unique: true });

export const AvaliacaoAluno = mongoose.model<IAvaliacaoAluno>('AvaliacaoAluno', avaliacaoAlunoSchema);
