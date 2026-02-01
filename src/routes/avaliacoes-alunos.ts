import { Router, Request, Response } from 'express';
import { AvaliacaoAluno } from '../models/AvaliacaoAluno';
import { Avaliacao } from '../models/Avaliacao';
import { Aluno } from '../models/Aluno';
import { AuthRequest, authMiddleware, alunoOnly, professorOnly } from '../middleware/auth';

const router = Router();

// Criar avaliação aluno
router.post('/avaliacoes-alunos', authMiddleware, async (req: AuthRequest, res: Response) => {
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

// Listar todas as avaliações de alunos (Apenas Professores)
router.get('/avaliacoes-alunos', authMiddleware, professorOnly, async (req: AuthRequest, res: Response) => {
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

// Pesquisar avaliações alunos por ID da avaliação (Apenas Professores)
router.get('/avaliacoes-alunos/avaliacao/:idAvaliacao', authMiddleware, professorOnly, async (req: AuthRequest, res: Response) => {
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

// Obter avaliação aluno por ID (Apenas Professores)
router.get('/avaliacoes-alunos/:id', authMiddleware, professorOnly, async (req: AuthRequest, res: Response) => {
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

// Atualizar avaliação aluno (Apenas Professores)
router.put('/avaliacoes-alunos/:id', authMiddleware, professorOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { observacoes, nota, idAvaliacao, idAluno } = req.body;

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

    if (idAvaliacao !== undefined) {
      const avaliacao = await Avaliacao.findById(idAvaliacao);
      if (!avaliacao) {
        return res.status(404).json({ erro: 'Avaliação não encontrada' });
      }
      avaliacaoAluno.idAvaliacao = idAvaliacao;
    }

    if (idAluno !== undefined) {
      const aluno = await Aluno.findById(idAluno);
      if (!aluno) {
        return res.status(404).json({ erro: 'Aluno não encontrado' });
      }
      avaliacaoAluno.idAluno = idAluno;
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
  } catch (erro: any) {
    if (erro.code === 11000) {
      return res.status(400).json({ erro: 'Este aluno já possui uma avaliação registrada para esta avaliação' });
    }
    res.status(500).json({ erro: 'Erro ao atualizar avaliação do aluno' });
  }
});

// Deletar avaliação aluno (Apenas Professores)
router.delete('/avaliacoes-alunos/:id', authMiddleware, professorOnly, async (req: AuthRequest, res: Response) => {
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

// Endpoint: Obter avaliações para reforço (notas < 7) com cursos de reforço sugeridos
// Endpoint: Obter avaliações para reforço (notas < 7) com cursos de reforço sugeridos
router.get('/alunos/:idAluno/resumo-avaliacoes', authMiddleware, alunoOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { idAluno } = req.params;

    // Verificar se o aluno está acessando apenas seus próprios dados
    if (req.user?.id !== idAluno) {
      return res.status(403).json({ erro: 'Você só pode acessar suas próprias avaliações' });
    }

    // Buscar todas as avaliações do aluno com dados completos
    const avaliacoesAluno = await AvaliacaoAluno.find({
      idAluno
    }).populate([
      {
        path: 'idAvaliacao',
        populate: {
          path: 'idCurso',
          populate: [
            { path: 'idProfessor', select: '-senha' },
            { path: 'idCursoReforco' }
          ]
        }
      },
      { path: 'idAluno', select: '-senha' }
    ]).sort({ createdAt: -1 });

    if (avaliacoesAluno.length === 0) {
      return res.status(404).json({ erro: 'Nenhuma avaliação encontrada para este aluno' });
    }

    // Agrupar por curso e pegar a última avaliação de cada um (ignora registros com dados faltantes)
    const cursoMap = new Map<string, any>();

    for (const avaliacaoAluno of avaliacoesAluno) {
      try {
        const avaliacaoPop = avaliacaoAluno.idAvaliacao as any;

        // Verifica se a avaliação está populada e é um objeto
        if (!avaliacaoPop || typeof avaliacaoPop !== 'object') {
          console.warn(`Avaliação referenciada inválida para AvaliacaoAluno ${avaliacaoAluno._id}:`, avaliacaoPop);
          continue;
        }

        const curso = avaliacaoPop.idCurso;

        // Verifica se o curso da avaliação está populado e é um objeto
        if (!curso || typeof curso !== 'object') {
          console.warn(`Curso inválido para Avaliação ${avaliacaoPop._id} (AvaliacaoAluno ${avaliacaoAluno._id}):`, curso);
          continue;
        }

        const cursoId = curso._id ? String(curso._id) : String(curso);

        if (!cursoMap.has(cursoId)) {
          cursoMap.set(cursoId, avaliacaoAluno);
        }
      } catch (err: any) {
        // Log detalhado para identificar o registro problemático
        try {
          console.error('Erro ao processar AvaliacaoAluno:', {
            idAvaliacaoAluno: avaliacaoAluno._id,
            idAvaliacao: (avaliacaoAluno as any).idAvaliacao,
            erro: err && err.message ? err.message : err
          });
        } catch (e) {
          console.error('Erro ao logar AvaliacaoAluno problemático e falha adicional:', e);
        }

        continue;
      }
    }

    // Filtrar apenas avaliações com nota < 7 e com curso de reforço
    const avaliacoesComReforco: Array<any> = [];

    for (const [cursoId, avaliacaoAluno] of cursoMap) {
      const avaliacaoPop = avaliacaoAluno.idAvaliacao as any;
      const curso = avaliacaoPop ? avaliacaoPop.idCurso : null;

      if (!curso) continue;

      const cursoReforcoData = curso.idCursoReforco;

      if (avaliacaoAluno.nota < 7 && cursoReforcoData) {
        const nomeReforco = (cursoReforcoData as any).nome || 'Curso de Reforço';
        
        avaliacoesComReforco.push({
          idAvaliacao: avaliacaoAluno._id,
          nomeAvaliacao: avaliacaoPop.nome,
          dataAvaliacao: avaliacaoPop.dataAvaliacao,
          nomeCurso: curso.nome,
          nota: avaliacaoAluno.nota,
          observacoes: avaliacaoAluno.observacoes,
          nomeReforco: nomeReforco,
          cursoReforco: {
            id: cursoReforcoData._id,
            nome: nomeReforco,
            descricao: (cursoReforcoData as any).descricao
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
    res.status(500).json({ erro: 'Erro ao gerar avaliações para reforço' });
  }
});

// Pesquisar avaliações alunos por ID do aluno (com autenticação)
router.get('/avaliacoes-alunos/aluno/:idAluno', authMiddleware, alunoOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { idAluno } = req.params;

    // Verificar se o aluno está acessando apenas seus próprios dados
    if (req.user?.id !== idAluno) {
      return res.status(403).json({ erro: 'Você só pode acessar suas próprias avaliações' });
    }

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

// Obter todos os alunos que precisam de reforço (notas < 7) - Apenas Professores

export default router;
