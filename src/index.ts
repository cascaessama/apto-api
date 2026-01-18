import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import professoresRouter from './routes/professores';
import alunosRouter from './routes/alunos';
import cursosRouter from './routes/cursos';
import avaliacoesRouter from './routes/avaliacoes';
import avaliacoesAlunosRouter from './routes/avaliacoes-alunos';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3010;
const MONGO_URL = process.env.MONGO_URL;

// Middleware
app.use(express.json());

// Conectar ao MongoDB
mongoose.connect(MONGO_URL as string)
  .then(() => {
    console.log('Conectado ao MongoDB com sucesso');
  })
  .catch((erro) => {
    console.error('Erro ao conectar ao MongoDB:', erro);
    process.exit(1);
  });

// Rotas
app.use('/api', professoresRouter);
app.use('/api', alunosRouter);
app.use('/api', cursosRouter);
app.use('/api', avaliacoesRouter);
app.use('/api', avaliacoesAlunosRouter);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'API está funcionando' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
