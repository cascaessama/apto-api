import { Router, Request, Response } from 'express';
import { Avaliacao } from '../models/Avaliacao';
import { Curso } from '../models/Curso';
import { authMiddleware, professorOnly, AuthRequest } from '../middleware/auth';

const router = Router();

// Criar avaliação (Apenas Professores)
router.post('/avaliacoes', authMiddleware, professorOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { nome, descricao, dataAvaliacao, idCurso } = req.body;

    if (!nome || !descricao || !dataAvaliacao || !idCurso) {
      return res.status(400).json({ erro: 'Nome, descrição, data da avaliação e ID do curso são obrigatórios' });
    }

    if (descricao.length > 500) {
      return res.status(400).json({ erro: 'Descrição não pode exceder 500 caracteres' });
    }

    // Verificar se o curso existe
    const curso = await Curso.findById(idCurso);
    if (!curso) {
      return res.status(404).json({ erro: 'Curso não encontrado' });
    }

    const novaAvaliacao = new Avaliacao({
      nome,
      descricao,
      dataAvaliacao,
      idCurso
    });

    await novaAvaliacao.save();
    await novaAvaliacao.populate({
      path: 'idCurso',
      populate: { path: 'idProfessor', select: '-senha' }
    });

    res.status(201).json({
      id: novaAvaliacao._id,
      nome: novaAvaliacao.nome,
      descricao: novaAvaliacao.descricao,
      dataAvaliacao: novaAvaliacao.dataAvaliacao,
      idCurso: novaAvaliacao.idCurso,
      mensagem: 'Avaliação criada com sucesso'
    });
  } catch (erro: any) {
    if (erro.code === 11000) {
      return res.status(400).json({ erro: 'Este nome de avaliação já existe' });
    }
    res.status(500).json({ erro: 'Erro ao criar avaliação' });
  }
});

// Listar todas as avaliações (Apenas Professores)
router.get('/avaliacoes', authMiddleware, professorOnly, async (req: AuthRequest, res: Response) => {
  try {
    const avaliacoes = await Avaliacao.find().populate({
      path: 'idCurso',
      populate: { path: 'idProfessor', select: '-senha' }
    });
    res.json(avaliacoes);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar avaliações' });
  }
});

// Obter avaliação por ID (Apenas Professores)
router.get('/avaliacoes/:id', authMiddleware, professorOnly, async (req: AuthRequest, res: Response) => {
  try {
    const avaliacao = await Avaliacao.findById(req.params.id).populate({
      path: 'idCurso',
      populate: { path: 'idProfessor', select: '-senha' }
    });

    if (!avaliacao) {
      return res.status(404).json({ erro: 'Avaliação não encontrada' });
    }

    res.json(avaliacao);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar avaliação' });
  }
});

// Pesquisar avaliação por nome (Apenas Professores)
router.get('/avaliacoes/nome/:nome', authMiddleware, professorOnly, async (req: AuthRequest, res: Response) => {
  try {
    const avaliacoes = await Avaliacao.find({
      nome: { $regex: req.params.nome, $options: 'i' }
    }).populate({
      path: 'idCurso',
      populate: { path: 'idProfessor', select: '-senha' }
    });

    if (avaliacoes.length === 0) {
      return res.status(404).json({ erro: 'Nenhuma avaliação encontrada com este nome' });
    }

    res.json(avaliacoes);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao pesquisar avaliação' });
  }
});

// Atualizar avaliação (Apenas Professores)
router.put('/avaliacoes/:id', authMiddleware, professorOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { nome, descricao, dataAvaliacao, idCurso } = req.body;

    const avaliacao = await Avaliacao.findById(req.params.id);

    if (!avaliacao) {
      return res.status(404).json({ erro: 'Avaliação não encontrada' });
    }

    if (nome) avaliacao.nome = nome;

    if (descricao) {
      if (descricao.length > 500) {
        return res.status(400).json({ erro: 'Descrição não pode exceder 500 caracteres' });
      }
      avaliacao.descricao = descricao;
    }

    if (dataAvaliacao) avaliacao.dataAvaliacao = dataAvaliacao;

    if (idCurso) {
      // Verificar se o novo curso existe
      const curso = await Curso.findById(idCurso);
      if (!curso) {
        return res.status(404).json({ erro: 'Curso não encontrado' });
      }
      avaliacao.idCurso = idCurso;
    }

    await avaliacao.save();
    await avaliacao.populate({
      path: 'idCurso',
      populate: { path: 'idProfessor', select: '-senha' }
    });

    res.json({
      id: avaliacao._id,
      nome: avaliacao.nome,
      descricao: avaliacao.descricao,
      dataAvaliacao: avaliacao.dataAvaliacao,
      idCurso: avaliacao.idCurso,
      mensagem: 'Avaliação atualizada com sucesso'
    });
  } catch (erro: any) {
    if (erro.code === 11000) {
      return res.status(400).json({ erro: 'Este nome de avaliação já existe' });
    }
    res.status(500).json({ erro: 'Erro ao atualizar avaliação' });
  }
});

// Deletar avaliação (Apenas Professores)
router.delete('/avaliacoes/:id', authMiddleware, professorOnly, async (req: AuthRequest, res: Response) => {
  try {
    const avaliacao = await Avaliacao.findByIdAndDelete(req.params.id);

    if (!avaliacao) {
      return res.status(404).json({ erro: 'Avaliação não encontrada' });
    }

    res.json({ mensagem: 'Avaliação removida com sucesso' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao remover avaliação' });
  }
});

export default router;
