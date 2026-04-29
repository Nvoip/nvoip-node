# nvoip-node

Cliente Node.js simples para a API v2 da Nvoip.

## Requisitos

- Node.js 18+

## Fluxos cobertos

- gerar `access_token`
- renovar token
- consultar saldo
- enviar SMS
- realizar chamada
- consultar chamada
- enviar OTP
- listar templates de WhatsApp
- enviar template de WhatsApp

## Configuração

```bash
cp .env.example .env
```

Ou exporte as variáveis:

```bash
export NVOIP_NUMBERSIP="seu_numbersip"
export NVOIP_USER_TOKEN="seu_user_token"
export NVOIP_TARGET_NUMBER="11999999999"
export NVOIP_SMS_MESSAGE="Mensagem de teste Nvoip"
```

## Exemplos

Enviar SMS:

```bash
npm run send:sms
```

Consultar saldo:

```bash
npm run balance
```

## Observação

Para times Node, faz sentido publicar uma segunda versão em TypeScript depois desta base inicial. Em GitHub Octoverse 2025, TypeScript passou a liderar em contribuição mensal, o que reforça o valor de ter uma variante tipada para adoção empresarial.

## Documentação oficial

- https://nvoip.docs.apiary.io/
- https://www.nvoip.com.br/api
