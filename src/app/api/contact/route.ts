import { NextRequest, NextResponse } from 'next/server';

// Este é um exemplo básico. Para produção, integre com:
// - Serviço de email (Resend, SendGrid, etc)
// - Sistema de CRM
// - Banco de dados de contatos

export async function POST(request: NextRequest) {
  try {
    const { nome, email, empresa, telefone, mensagem } = await request.json();

    // Validações básicas
    if (!nome || !email || !empresa || !telefone || !mensagem) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // TODO: Implementar envio de email e armazenamento no banco

    console.log('Novo contato de patrocinador:', {
      nome,
      email,
      empresa,
      telefone,
      mensagem,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { message: 'Contato recebido com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: 'Erro ao processar contato' },
      { status: 500 }
    );
  }
}
