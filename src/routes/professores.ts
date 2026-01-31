import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { Professor } from '../models/Professor';
import { AuthRequest, authMiddleware, professorOnly } from '../middleware/auth';

const router = Router();

// Login professor
router.post('/professores/login', async (req: Request, res: Response) => {
  try {
    const { nome, senha } = req.body;

    if (!nome || !senha) {
      return res.status(400).json({ erro: 'Nome e senha são obrigatórios' });
    }

    const professor = await Professor.findOne({ nome });
    
    if (!professor) {
      return res.status(404).json({ erro: 'Professor não encontrado' });
    }

    const senhaValida = await bcryptjs.compare(senha, professor.senha);
    
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha incorreta' });
    }

    const token = jwt.sign(
      {
        id: professor._id,
        tipo: 'professor',
        nome: professor.nome
      },
      process.env.JWT_SECRET || 'fiap25',
      { expiresIn: '24h' }
    );

    res.json({
      mensagem: 'Login realizado com sucesso',
      token,
      usuario: {
        id: professor._id,
        nome: professor.nome,
        tipo: 'professor'
      }
    });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao realizar login' });
  }
});

// Criar professor
router.post('/professores', authMiddleware, professorOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { nome, senha } = req.body;

    if (!nome || !senha) {
      return res.status(400).json({ erro: 'Nome e senha são obrigatórios' });
    }

    const novoProfessor = new Professor({ nome, senha });
    await novoProfessor.save();

    res.status(201).json({
      id: novoProfessor._id,
      nome: novoProfessor.nome,
      mensagem: 'Professor criado com sucesso'
    });
  } catch (erro: any) {
    if (erro.code === 11000) {
      return res.status(400).json({ erro: 'Este nome de professor já existe' });
    }
    res.status(500).json({ erro: 'Erro ao criar professor' });
  }
});

// Listar todos os professores
router.get('/professores', authMiddleware, professorOnly, async (req: AuthRequest, res: Response) => {
  try {
    const professores = await Professor.find().select('-senha');
    res.json(professores);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar professores' });
  }
});

// Obter professor por ID
router.get('/professores/:id', authMiddleware, professorOnly, async (req: AuthRequest, res: Response) => {
  try {
    const professor = await Professor.findById(req.params.id).select('-senha');
    
    if (!professor) {
      return res.status(404).json({ erro: 'Professor não encontrado' });
    }

    res.json(professor);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar professor' });
  }
});

// Pesquisar professor por nome
router.get('/professores/nome/:nome', authMiddleware, professorOnly, async (req: AuthRequest, res: Response) => {
  try {
    const professores = await Professor.find({
      nome: { $regex: req.params.nome, $options: 'i' }
    }).select('-senha');

    if (professores.length === 0) {
      return res.status(404).json({ erro: 'Nenhum professor encontrado com este nome' });
    }

    res.json(professores);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao pesquisar professor' });
  }
});

// Atualizar professor
router.put('/professores/:id', authMiddleware, professorOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { nome, senha } = req.body;

    const professor = await Professor.findById(req.params.id);

    if (!professor) {
      return res.status(404).json({ erro: 'Professor não encontrado' });
    }

    if (nome) professor.nome = nome;
    if (senha) professor.senha = senha;

    await professor.save();

    res.json({
      id: professor._id,
      nome: professor.nome,
      mensagem: 'Professor atualizado com sucesso'
    });
  } catch (erro: any) {
    if (erro.code === 11000) {
      return res.status(400).json({ erro: 'Este nome de professor já existe' });
    }
    res.status(500).json({ erro: 'Erro ao atualizar professor' });
  }
});

// Deletar professor
router.delete('/professores/:id', authMiddleware, professorOnly, async (req: AuthRequest, res: Response) => {
  try {
    const professor = await Professor.findByIdAndDelete(req.params.id);

    if (!professor) {
      return res.status(404).json({ erro: 'Professor não encontrado' });
    }

    res.json({ mensagem: 'Professor removido com sucesso' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao remover professor' });
  }
});

export default router;
