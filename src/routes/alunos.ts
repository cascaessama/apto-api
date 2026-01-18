import { Router, Request, Response } from 'express';
import { Aluno } from '../models/Aluno';

const router = Router();

// Criar aluno
router.post('/alunos', async (req: Request, res: Response) => {
  try {
    const { nome, senha } = req.body;

    if (!nome || !senha) {
      return res.status(400).json({ erro: 'Nome e senha são obrigatórios' });
    }

    const novoAluno = new Aluno({ nome, senha });
    await novoAluno.save();

    res.status(201).json({
      id: novoAluno._id,
      nome: novoAluno.nome,
      mensagem: 'Aluno criado com sucesso'
    });
  } catch (erro: any) {
    if (erro.code === 11000) {
      return res.status(400).json({ erro: 'Este nome de aluno já existe' });
    }
    res.status(500).json({ erro: 'Erro ao criar aluno' });
  }
});

// Listar todos os alunos
router.get('/alunos', async (req: Request, res: Response) => {
  try {
    const alunos = await Aluno.find().select('-senha');
    res.json(alunos);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar alunos' });
  }
});

// Obter aluno por ID
router.get('/alunos/:id', async (req: Request, res: Response) => {
  try {
    const aluno = await Aluno.findById(req.params.id).select('-senha');
    
    if (!aluno) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }

    res.json(aluno);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar aluno' });
  }
});

// Pesquisar aluno por nome
router.get('/alunos/nome/:nome', async (req: Request, res: Response) => {
  try {
    const alunos = await Aluno.find({
      nome: { $regex: req.params.nome, $options: 'i' }
    }).select('-senha');

    if (alunos.length === 0) {
      return res.status(404).json({ erro: 'Nenhum aluno encontrado com este nome' });
    }

    res.json(alunos);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao pesquisar aluno' });
  }
});

// Atualizar aluno
router.put('/alunos/:id', async (req: Request, res: Response) => {
  try {
    const { nome, senha } = req.body;

    const aluno = await Aluno.findById(req.params.id);

    if (!aluno) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }

    if (nome) aluno.nome = nome;
    if (senha) aluno.senha = senha;

    await aluno.save();

    res.json({
      id: aluno._id,
      nome: aluno.nome,
      mensagem: 'Aluno atualizado com sucesso'
    });
  } catch (erro: any) {
    if (erro.code === 11000) {
      return res.status(400).json({ erro: 'Este nome de aluno já existe' });
    }
    res.status(500).json({ erro: 'Erro ao atualizar aluno' });
  }
});

// Deletar aluno
router.delete('/alunos/:id', async (req: Request, res: Response) => {
  try {
    const aluno = await Aluno.findByIdAndDelete(req.params.id);

    if (!aluno) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }

    res.json({ mensagem: 'Aluno removido com sucesso' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao remover aluno' });
  }
});

export default router;
