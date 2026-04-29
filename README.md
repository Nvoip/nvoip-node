# nvoip-node

Cliente Node.js simples para a API v2 da Nvoip, com foco nos fluxos principais de autenticacao, ligacoes, OTP e WhatsApp.

## Requisitos

- Node.js 18+

## Configuracao

```bash
cp .env.example .env
```

Ou exporte as variaveis:

```bash
export NVOIP_NUMBERSIP="seu_numbersip"
export NVOIP_USER_TOKEN="seu_user_token"
export NVOIP_OAUTH_CLIENT_ID="seu_client_id"
export NVOIP_OAUTH_CLIENT_SECRET="seu_client_secret"
export NVOIP_CALLER="1049"
export NVOIP_TARGET_NUMBER="11999999999"
```

## Fluxos cobertos

- gerar `access_token`
- renovar token
- consultar saldo
- enviar SMS
- realizar chamada
- enviar OTP
- validar OTP
- listar templates de WhatsApp
- enviar template de WhatsApp

## Scripts prontos

- `npm run auth:token`
- `npm run balance`
- `npm run call:create`
- `npm run otp:send`
- `npm run otp:check`
- `npm run send:sms`
- `npm run wa:list`
- `npm run wa:send`

## SDK web

Para o fluxo de popup com telefone e codigo, use o repositório `nvoip-web-sdk`. Ele fica responsavel pela UI embutivel; este repo cobre o consumo server-side da API.

## Documentacao oficial

- https://nvoip.docs.apiary.io/
- https://www.nvoip.com.br/api
