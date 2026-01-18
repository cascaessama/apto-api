import mongoose from 'mongoose';

interface ICurso extends mongoose.Document {
  nome: string;
  descricao: string;
  idCursoReforco?: mongoose.Types.ObjectId;
  idProfessor: mongoose.Types.ObjectId;
}

const cursoSchema = new mongoose.Schema<ICurso>({
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
  idCursoReforco: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Curso',
    default: null
  },
  idProfessor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professor',
    required: true
  }
}, {
  timestamps: true
});

export const Curso = mongoose.model<ICurso>('Curso', cursoSchema);
