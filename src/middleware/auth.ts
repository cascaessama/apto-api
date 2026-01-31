import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    tipo: 'professor' | 'aluno';
    nome: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fiap25');
    req.user = decoded;
    next();
  } catch (erro) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
};

export const professorOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.tipo !== 'professor') {
    return res.status(403).json({ erro: 'Acesso restrito a professores' });
  }
  next();
};

export const alunoOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.tipo !== 'aluno') {
    return res.status(403).json({ erro: 'Acesso restrito a alunos' });
  }
  next();
};
