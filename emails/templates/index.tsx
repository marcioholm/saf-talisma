import React from "react";
import { Layout } from "../components/Layout";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Button } from "../components/Button";
import { InfoBox } from "../components/InfoBox";
import { associationConfig } from "../../lib/association-config";

// Base Template Type
type EmailProps = {
  userName?: string;
};

// 1. Welcome
export const WelcomeEmail = ({ userName }: EmailProps) => (
  <Layout preview={`Bem-vindo à ${associationConfig.name}!`}>
    <Header />
    <div style={{ padding: "32px 24px" }}>
      <h2>Olá, {userName || "torcedor"}!</h2>
      <p>Seja muito bem-vindo à família {associationConfig.name}. Estamos felizes em ter você com a gente.</p>
      <Button href={associationConfig.url}>Acesse nosso site</Button>
    </div>
    <Footer />
  </Layout>
);

// 2. Password Reset
export const PasswordResetEmail = ({ userName, resetUrl }: EmailProps & { resetUrl: string }) => (
  <Layout preview="Recuperação de senha">
    <Header />
    <div style={{ padding: "32px 24px" }}>
      <h2>Recuperação de Senha</h2>
      <p>Olá, {userName || "usuário"}. Recebemos um pedido para redefinir sua senha.</p>
      <Button href={resetUrl}>Redefinir Senha</Button>
      <InfoBox>
        Se você não solicitou a redefinição, pode ignorar este e-mail com segurança.
      </InfoBox>
    </div>
    <Footer />
  </Layout>
);

// 3. Contact Form User (Confirmation to User)
export const ContactFormUserEmail = ({ userName, message }: EmailProps & { message: string }) => (
  <Layout preview="Recebemos sua mensagem">
    <Header />
    <div style={{ padding: "32px 24px" }}>
      <h2>Mensagem recebida com sucesso</h2>
      <p>Olá, {userName}. Agradecemos o seu contato! Nossa equipe retornará o mais breve possível.</p>
      <InfoBox>
        <strong>Sua mensagem:</strong><br /><br />
        {message}
      </InfoBox>
    </div>
    <Footer />
  </Layout>
);

// 4. Contact Form Admin (Notification to Admin)
export const ContactFormAdminEmail = ({ userName, email, message }: EmailProps & { email: string; message: string }) => (
  <Layout preview="Novo contato pelo site">
    <Header />
    <div style={{ padding: "32px 24px" }}>
      <h2>Novo contato recebido</h2>
      <p>Uma nova mensagem foi enviada pelo formulário de contato do site.</p>
      <InfoBox>
        <strong>Nome:</strong> {userName}<br />
        <strong>E-mail:</strong> {email}<br />
        <strong>Mensagem:</strong><br /><br />
        {message}
      </InfoBox>
    </div>
    <Footer />
  </Layout>
);

// 5. Partner Form User
export const PartnerFormUserEmail = ({ userName }: EmailProps) => (
  <Layout preview="Agradecemos seu interesse de parceria">
    <Header />
    <div style={{ padding: "32px 24px" }}>
      <h2>Parceria com {associationConfig.name}</h2>
      <p>Olá, {userName}. Recebemos seu interesse em se tornar um parceiro! Nossa diretoria entrará em contato em breve para apresentar nossas cotas de patrocínio e projetos.</p>
    </div>
    <Footer />
  </Layout>
);

// 6. Partner Form Admin
export const PartnerFormAdminEmail = ({ userName, email, phone, company, message }: EmailProps & { email: string; phone: string; company?: string; message?: string }) => (
  <Layout preview="Nova solicitação de parceria">
    <Header />
    <div style={{ padding: "32px 24px" }}>
      <h2>Novo interesse em patrocínio</h2>
      <InfoBox>
        <strong>Nome:</strong> {userName}<br />
        <strong>E-mail:</strong> {email}<br />
        <strong>Telefone:</strong> {phone}<br />
        {company && <><br /><strong>Empresa:</strong> {company}</>}
        {message && <><br /><br /><strong>Mensagem:</strong><br />{message}</>}
      </InfoBox>
    </div>
    <Footer />
  </Layout>
);

// 7. Newsletter Confirm
export const NewsletterConfirmEmail = ({ confirmUrl }: { confirmUrl: string }) => (
  <Layout preview="Confirme sua inscrição na Newsletter">
    <Header />
    <div style={{ padding: "32px 24px" }}>
      <h2>Quase lá!</h2>
      <p>Para começar a receber as novidades da {associationConfig.name}, confirme seu e-mail clicando no botão abaixo:</p>
      <Button href={confirmUrl}>Confirmar Inscrição</Button>
    </div>
    <Footer />
  </Layout>
);

// 8. Newsletter Welcome
export const NewsletterWelcomeEmail = () => (
  <Layout preview={`Bem-vindo à Newsletter da ${associationConfig.name}`}>
    <Header />
    <div style={{ padding: "32px 24px" }}>
      <h2>Inscrição confirmada!</h2>
      <p>Agora você faz parte da nossa lista de contatos e ficará sabendo de todas as novidades, jogos e eventos da {associationConfig.name} em primeira mão.</p>
    </div>
    <Footer />
  </Layout>
);

// 9. News Broadcast
export const NewsBroadcastEmail = ({ title, summary, url }: { title: string; summary: string; url: string }) => (
  <Layout preview={title}>
    <Header />
    <div style={{ padding: "32px 24px" }}>
      <h2>{title}</h2>
      <p>{summary}</p>
      <Button href={url}>Ler notícia completa</Button>
    </div>
    <Footer />
  </Layout>
);

// 10. Game Reminder
export const GameReminderEmail = ({ matchName, date, location, url }: { matchName: string; date: string; location: string; url: string }) => (
  <Layout preview={`Lembrete de Jogo: ${matchName}`}>
    <Header />
    <div style={{ padding: "32px 24px" }}>
      <h2>Lembrete de Jogo</h2>
      <p>O próximo desafio da {associationConfig.name} está chegando!</p>
      <InfoBox>
        <strong>Jogo:</strong> {matchName}<br />
        <strong>Data:</strong> {date}<br />
        <strong>Local:</strong> {location}
      </InfoBox>
      <Button href={url}>Mais detalhes</Button>
    </div>
    <Footer />
  </Layout>
);

// 11. Event Invite
export const EventInviteEmail = ({ eventName, date, description, rsvpUrl }: { eventName: string; date: string; description: string; rsvpUrl: string }) => (
  <Layout preview={`Convite: ${eventName}`}>
    <Header />
    <div style={{ padding: "32px 24px" }}>
      <h2>Você está convidado!</h2>
      <p>{description}</p>
      <InfoBox>
        <strong>Evento:</strong> {eventName}<br />
        <strong>Data:</strong> {date}
      </InfoBox>
      <Button href={rsvpUrl}>Confirmar Presença</Button>
    </div>
    <Footer />
  </Layout>
);

// 12. Invoice Created
export const InvoiceCreatedEmail = ({ userName, description, amount, dueDate, paymentUrl }: EmailProps & { description: string; amount: string; dueDate: string; paymentUrl: string }) => (
  <Layout preview={`Nova cobrança: ${description}`}>
    <Header />
    <div style={{ padding: "32px 24px" }}>
      <h2>Aviso de Vencimento</h2>
      <p>Olá, {userName}. Uma nova fatura foi gerada e está disponível para pagamento.</p>
      <InfoBox>
        <strong>Referência:</strong> {description}<br />
        <strong>Valor:</strong> {amount}<br />
        <strong>Vencimento:</strong> {dueDate}
      </InfoBox>
      <Button href={paymentUrl}>Acessar Fatura</Button>
    </div>
    <Footer />
  </Layout>
);

// 13. Invoice Paid
export const InvoicePaidEmail = ({ userName, description, amount }: EmailProps & { description: string; amount: string }) => (
  <Layout preview="Pagamento confirmado">
    <Header />
    <div style={{ padding: "32px 24px" }}>
      <h2>Pagamento Confirmado</h2>
      <p>Olá, {userName}. Confirmamos o recebimento do seu pagamento. Agradecemos o seu apoio!</p>
      <InfoBox>
        <strong>Referência:</strong> {description}<br />
        <strong>Valor:</strong> {amount}
      </InfoBox>
    </div>
    <Footer />
  </Layout>
);

// 14. System Alert
export const SystemAlertEmail = ({ alertType, message }: { alertType: string; message: string }) => (
  <Layout preview={`ALERTA: ${alertType}`}>
    <Header />
    <div style={{ padding: "32px 24px" }}>
      <h2>Alerta de Sistema</h2>
      <p>Notificação automática do sistema da {associationConfig.name}.</p>
      <InfoBox>
        <strong>Tipo:</strong> {alertType}<br />
        <strong>Detalhes:</strong> {message}
      </InfoBox>
    </div>
    <Footer />
  </Layout>
);

// 15. Account Deletion
export const AccountDeletionEmail = ({ userName }: EmailProps) => (
  <Layout preview="Confirmação de encerramento de conta">
    <Header />
    <div style={{ padding: "32px 24px" }}>
      <h2>Conta encerrada</h2>
      <p>Olá, {userName}. Sua conta foi encerrada conforme solicitado. Todos os seus dados foram removidos da nossa plataforma.</p>
      <p>Esperamos ver você novamente no futuro!</p>
    </div>
    <Footer />
  </Layout>
);
