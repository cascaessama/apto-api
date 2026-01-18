import { Router, Request, Response } from 'express';
import { Curso } from '../models/Curso';
import { Professor } from '../models/Professor';

const router = Router();

// Criar curso
router.post('/cursos', async (req: Request, res: Response) => {
  try {
    const { nome, descricao, idCursoReforco, idProfessor } = req.body;

    if (!nome || !descricao || !idProfessor) {
      return res.status(400).json({ erro: 'Nome, descrição e ID do professor são obrigatórios' });
    }

    if (descricao.length > 500) {
      return res.status(400).json({ erro: 'Descrição não pode exceder 500 caracteres' });
    }

    // Verificar se o professor existe
    const professor = await Professor.findById(idProfessor);
    if (!professor) {
      return res.status(404).json({ erro: 'Professor não encontrado' });
    }

    // Verificar se o curso de reforço existe (se fornecido)
    if (idCursoReforco) {
      const cursoReforco = await Curso.findById(idCursoReforco);
      if (!cursoReforco) {
        return res.status(404).json({ erro: 'Curso de reforço não encontrado' });
      }
    }

    const novoCurso = new Curso({
      nome,
      descricao,
      idCursoReforco: idCursoReforco || null,
      idProfessor
    });

    await novoCurso.save();
    await novoCurso.populate([
      { path: 'idProfessor', select: '-senha' },
      { path: 'idCursoReforco' }
    ]);

    res.status(201).json({
      id: novoCurso._id,
      nome: novoCurso.nome,
      descricao: novoCurso.descricao,
      idCursoReforco: novoCurso.idCursoReforco,
      idProfessor: novoCurso.idProfessor,
      mensagem: 'Curso criado com sucesso'
    });
  } catch (erro: any) {
    if (erro.code === 11000) {
      return res.status(400).json({ erro: 'Este nome de curso já existe' });
    }
    res.status(500).json({ erro: 'Erro ao criar curso' });
  }
});

// Listar todos os cursos
router.get('/cursos', async (req: Request, res: Response) => {
  try {
    const cursos = await Curso.find().populate([
      { path: 'idProfessor', select: '-senha' },
      { path: 'idCursoReforco' }
    ]);
    res.json(cursos);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar cursos' });
  }
});

// Obter curso por ID
router.get('/cursos/:id', async (req: Request, res: Response) => {
  try {
    const curso = await Curso.findById(req.params.id).populate([
      { path: 'idProfessor', select: '-senha' },
      { path: 'idCursoReforco' }
    ]);

    if (!curso) {
      return res.status(404).json({ erro: 'Curso não encontrado' });
    }

    res.json(curso);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar curso' });
  }
});

// Pesquisar curso por nome
router.get('/cursos/nome/:nome', async (req: Request, res: Response) => {
  try {
    const cursos = await Curso.find({
      nome: { $regex: req.params.nome, $options: 'i' }
    }).populate([
      { path: 'idProfessor', select: '-senha' },
      { path: 'idCursoReforco' }
    ]);

    if (cursos.length === 0) {
      return res.status(404).json({ erro: 'Nenhum curso encontrado com este nome' });
    }

    res.json(cursos);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao pesquisar curso' });
  }
});

// Atualizar curso
router.put('/cursos/:id', async (req: Request, res: Response) => {
  try {
    const { nome, descricao, idCursoReforco, idProfessor } = req.body;

    const curso = await Curso.findById(req.params.id);

    if (!curso) {
      return res.status(404).json({ erro: 'Curso não encontrado' });
    }

    if (nome) curso.nome = nome;

    if (descricao) {
      if (descricao.length > 500) {
        return res.status(400).json({ erro: 'Descrição não pode exceder 500 caracteres' });
      }
      curso.descricao = descricao;
    }

    if (idProfessor) {
      // Verificar se o novo professor existe
      const professor = await Professor.findById(idProfessor);
      if (!professor) {
        return res.status(404).json({ erro: 'Professor não encontrado' });
      }
      curso.idProfessor = idProfessor;
    }

    if (idCursoReforco !== undefined) {
      if (idCursoReforco) {
        // Verificar se o curso de reforço existe
        const cursoReforco = await Curso.findById(idCursoReforco);
        if (!cursoReforco) {
          return res.status(404).json({ erro: 'Curso de reforço não encontrado' });
        }
      }
      curso.idCursoReforco = idCursoReforco || null;
    }

    await curso.save();
    await curso.populate([
      { path: 'idProfessor', select: '-senha' },
      { path: 'idCursoReforco' }
    ]);

    res.json({
      id: curso._id,
      nome: curso.nome,
      descricao: curso.descricao,
      idCursoReforco: curso.idCursoReforco,
      idProfessor: curso.idProfessor,
      mensagem: 'Curso atualizado com sucesso'
    });
  } catch (erro: any) {
    if (erro.code === 11000) {
      return res.status(400).json({ erro: 'Este nome de curso já existe' });
    }
    res.status(500).json({ erro: 'Erro ao atualizar curso' });
  }
});

// Deletar curso
router.delete('/cursos/:id', async (req: Request, res: Response) => {
  try {
    const curso = await Curso.findByIdAndDelete(req.params.id);

    if (!curso) {
      return res.status(404).json({ erro: 'Curso não encontrado' });
    }

    res.json({ mensagem: 'Curso removido com sucesso' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao remover curso' });
  }
});

export default router;
