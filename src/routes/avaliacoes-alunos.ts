import { Router, Request, Response } from 'express';
import { AvaliacaoAluno } from '../models/AvaliacaoAluno';
import { Avaliacao } from '../models/Avaliacao';
import { Aluno } from '../models/Aluno';

const router = Router();

// Criar avaliação aluno
router.post('/avaliacoes-alunos', async (req: Request, res: Response) => {
  try {
    const { observacoes, nota, idAvaliacao, idAluno } = req.body;

    if (nota === undefined || idAvaliacao === undefined || idAluno === undefined) {
      return res.status(400).json({ erro: 'Nota, ID da avaliação e ID do aluno são obrigatórios' });
    }

    if (nota < 0 || nota > 10) {
      return res.status(400).json({ erro: 'Nota deve estar entre 0 e 10' });
    }

    // Verificar se a avaliação existe
    const avaliacao = await Avaliacao.findById(idAvaliacao);
    if (!avaliacao) {
      return res.status(404).json({ erro: 'Avaliação não encontrada' });
    }

    // Verificar se o aluno existe
    const aluno = await Aluno.findById(idAluno);
    if (!aluno) {
      return res.status(404).json({ erro: 'Aluno não encontrado' });
    }

    const novaAvaliacaoAluno = new AvaliacaoAluno({
      observacoes: observacoes || null,
      nota,
      idAvaliacao,
      idAluno
    });

    await novaAvaliacaoAluno.save();
    await novaAvaliacaoAluno.populate([
      {
        path: 'idAvaliacao',
        populate: {
          path: 'idCurso',
          populate: { path: 'idProfessor', select: '-senha' }
        }
      },
      { path: 'idAluno', select: '-senha' }
    ]);

    res.status(201).json({
      id: novaAvaliacaoAluno._id,
      observacoes: novaAvaliacaoAluno.observacoes,
      nota: novaAvaliacaoAluno.nota,
      idAvaliacao: novaAvaliacaoAluno.idAvaliacao,
      idAluno: novaAvaliacaoAluno.idAluno,
      mensagem: 'Avaliação do aluno criada com sucesso'
    });
  } catch (erro: any) {
    if (erro.code === 11000) {
      return res.status(400).json({ erro: 'Este aluno já possui uma avaliação registrada para esta avaliação' });
    }
    res.status(500).json({ erro: 'Erro ao criar avaliação do aluno' });
  }
});

// Listar todas as avaliações de alunos
router.get('/avaliacoes-alunos', async (req: Request, res: Response) => {
  try {
    const avaliacoesAlunos = await AvaliacaoAluno.find().populate([
      {
        path: 'idAvaliacao',
        populate: {
          path: 'idCurso',
          populate: { path: 'idProfessor', select: '-senha' }
        }
      },
      { path: 'idAluno', select: '-senha' }
    ]);
    res.json(avaliacoesAlunos);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar avaliações de alunos' });
  }
});

// Obter avaliação aluno por ID
router.get('/avaliacoes-alunos/:id', async (req: Request, res: Response) => {
  try {
    const avaliacaoAluno = await AvaliacaoAluno.findById(req.params.id).populate([
      {
        path: 'idAvaliacao',
        populate: {
          path: 'idCurso',
          populate: { path: 'idProfessor', select: '-senha' }
        }
      },
      { path: 'idAluno', select: '-senha' }
    ]);

    if (!avaliacaoAluno) {
      return res.status(404).json({ erro: 'Avaliação do aluno não encontrada' });
    }

    res.json(avaliacaoAluno);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar avaliação do aluno' });
  }
});

// Pesquisar avaliações alunos por ID da avaliação
router.get('/avaliacoes-alunos/avaliacao/:idAvaliacao', async (req: Request, res: Response) => {
  try {
    const avaliacoesAlunos = await AvaliacaoAluno.find({
      idAvaliacao: req.params.idAvaliacao
    }).populate([
      {
        path: 'idAvaliacao',
        populate: {
          path: 'idCurso',
          populate: { path: 'idProfessor', select: '-senha' }
        }
      },
      { path: 'idAluno', select: '-senha' }
    ]);

    if (avaliacoesAlunos.length === 0) {
      return res.status(404).json({ erro: 'Nenhuma avaliação encontrada para esta avaliação' });
    }

    res.json(avaliacoesAlunos);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao pesquisar avaliações de alunos' });
  }
});

// Pesquisar avaliações alunos por ID do aluno
router.get('/avaliacoes-alunos/aluno/:idAluno', async (req: Request, res: Response) => {
  try {
    const avaliacoesAlunos = await AvaliacaoAluno.find({
      idAluno: req.params.idAluno
    }).populate([
      {
        path: 'idAvaliacao',
        populate: {
          path: 'idCurso',
          populate: { path: 'idProfessor', select: '-senha' }
        }
      },
      { path: 'idAluno', select: '-senha' }
    ]);

    if (avaliacoesAlunos.length === 0) {
      return res.status(404).json({ erro: 'Nenhuma avaliação encontrada para este aluno' });
    }

    res.json(avaliacoesAlunos);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao pesquisar avaliações do aluno' });
  }
});

// Atualizar avaliação aluno
router.put('/avaliacoes-alunos/:id', async (req: Request, res: Response) => {
  try {
    const { observacoes, nota } = req.body;

    const avaliacaoAluno = await AvaliacaoAluno.findById(req.params.id);

    if (!avaliacaoAluno) {
      return res.status(404).json({ erro: 'Avaliação do aluno não encontrada' });
    }

    if (observacoes !== undefined) avaliacaoAluno.observacoes = observacoes;

    if (nota !== undefined) {
      if (nota < 0 || nota > 10) {
        return res.status(400).json({ erro: 'Nota deve estar entre 0 e 10' });
      }
      avaliacaoAluno.nota = nota;
    }

    await avaliacaoAluno.save();
    await avaliacaoAluno.populate([
      {
        path: 'idAvaliacao',
        populate: {
          path: 'idCurso',
          populate: { path: 'idProfessor', select: '-senha' }
        }
      },
      { path: 'idAluno', select: '-senha' }
    ]);

    res.json({
      id: avaliacaoAluno._id,
      observacoes: avaliacaoAluno.observacoes,
      nota: avaliacaoAluno.nota,
      idAvaliacao: avaliacaoAluno.idAvaliacao,
      idAluno: avaliacaoAluno.idAluno,
      mensagem: 'Avaliação do aluno atualizada com sucesso'
    });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao atualizar avaliação do aluno' });
  }
});

// Deletar avaliação aluno
router.delete('/avaliacoes-alunos/:id', async (req: Request, res: Response) => {
  try {
    const avaliacaoAluno = await AvaliacaoAluno.findByIdAndDelete(req.params.id);

    if (!avaliacaoAluno) {
      return res.status(404).json({ erro: 'Avaliação do aluno não encontrada' });
    }

    res.json({ mensagem: 'Avaliação do aluno removida com sucesso' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao remover avaliação do aluno' });
  }
});

// Endpoint: Obter resumo de avaliações por curso e cursos de reforço
router.get('/alunos/:idAluno/resumo-avaliacoes', async (req: Request, res: Response) => {
  try {
    const { idAluno } = req.params;

    // Buscar todas as avaliações do aluno com dados completos
    const avaliacoesAluno = await AvaliacaoAluno.find({
      idAluno
    }).populate([
      {
        path: 'idAvaliacao',
        populate: {
          path: 'idCurso',
          populate: { path: 'idProfessor', select: '-senha' }
        }
      },
      { path: 'idAluno', select: '-senha' }
    ]).sort({ createdAt: -1 });

    if (avaliacoesAluno.length === 0) {
      return res.status(404).json({ erro: 'Nenhuma avaliação encontrada para este aluno' });
    }

    // Agrupar por curso e pegar a última avaliação de cada um
    const cursoMap = new Map();

    for (const avaliacaoAluno of avaliacoesAluno) {
      const cursoId = (avaliacaoAluno.idAvaliacao as any).idCurso._id.toString();

      if (!cursoMap.has(cursoId)) {
        cursoMap.set(cursoId, avaliacaoAluno);
      }
    }

    // Filtrar apenas avaliações com nota < 7 e com curso de reforço
    const avaliacoesComReforco = [];

    for (const [cursoId, avaliacaoAluno] of cursoMap) {
      const curso = (avaliacaoAluno.idAvaliacao as any).idCurso;

      if (avaliacaoAluno.nota < 7 && curso.idCursoReforco) {
        const cursoReforcoData = curso.idCursoReforco;
        
        avaliacoesComReforco.push({
          idAvaliacao: avaliacaoAluno._id,
          cursoReforco: {
            id: cursoReforcoData._id,
            nome: cursoReforcoData.nome,
            descricao: cursoReforcoData.descricao
          }
        });
      }
    }

    res.json({
      idAluno,
      avaliacoesComReforco
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: 'Erro ao gerar resumo de avaliações' });
  }
});

export default router;
