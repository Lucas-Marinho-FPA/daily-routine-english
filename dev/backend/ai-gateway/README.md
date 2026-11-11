# AI Gateway de referência (não implantado)

Serviço mínimo para a avaliação semântica das traduções da fase 3 das atividades de diálogo. **Nada aqui está
implantado, contratado ou configurado.** Escolher o provedor, criar a conta, a chave e o servidor (e assumir o custo)
são decisões do Product Owner.

- `gateway.mjs` — handler provider-neutral: valida o pedido, limita frequência, deduplica por `attemptId`
  (idempotência), aplica a rubrica versionada (`rubric-dre-translation-semantic-1.md`), chama o provedor e **valida a
  saída do modelo** com o mesmo validador do app (`app/js/engine/dialogueeval.js`) antes de devolver.
- Provedor: objeto `{ id, evaluate({ system, user }) → JSON }`. Nenhum adaptador real vem pronto: o adaptador do
  fornecedor escolhido lê a chave de uma variável de ambiente **do servidor**. Testes usam um provedor de teste
  (`tests/unit/gateway.test.js`) — que nunca pode ser usado em produção como “avaliação”.
- Contrato HTTP: `POST /v1/evaluate/translation` com o corpo de `translationRequest()`; resposta conforme
  `validateTranslationResult()`; cabeçalho `idempotency-key` = `attemptId`. CORS restrito à origem do app.

## Ativar no app (depois de implantado e aprovado)

```bash
DRG_EVAL_ENDPOINT=https://<serviço-aprovado> node tools/build-app.mjs
```

O build grava o endereço em `data/dialogues.js` e acrescenta **só essa origem** ao `connect-src` da CSP do
`index.html`. Sem a variável, nada muda: a CSP continua só `'self'` e as traduções não idênticas à referência ficam
pendentes no aparelho.

## Privacidade

O pedido leva só a fala, o diálogo (texto do conteúdo), a tradução de referência e o texto da resposta — sem nome,
perfil, gravação ou identificador do aluno. O app pede autorização antes do primeiro envio. O gateway não deve registrar
o texto da resposta; retenção e exclusão precisam ser definidas junto com o provedor.
