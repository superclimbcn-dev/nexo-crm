# Regras Principais do Projeto

## Idioma

- O idioma usado no chat com o cliente nao define automaticamente o idioma do projeto.
- O idioma do produto, interface, mensagens automaticas e textos visiveis ao usuario deve seguir o idioma real do projeto.
- Neste projeto, por padrao, os textos do produto devem ser mantidos em espanhol, salvo instrucao explicita em contrario.
- Se houver conflito entre o idioma da conversa e o idioma do sistema, priorizar o idioma do sistema.

## Confirmacao Antes de Assumir

- Em caso de duvida sobre idioma, regras de negocio, ambiente, endpoint oficial ou fluxo esperado, perguntar antes de implementar.
- Nunca assumir uma regra funcional importante sem confirmacao quando houver ambiguidade real.
- Se existirem dois caminhos tecnicos validos com impacto de negocio, confirmar qual deve ser seguido.

## Regras de Implementacao

- Nao usar `any`.
- Manter TypeScript estrito.
- Evitar duplicacao de logica e aplicar principio DRY.
- Centralizar regras de negocio compartilhadas em servicos ou modulos reutilizaveis.
- Antes de alterar comportamento visivel ao usuario, verificar consistencia com o restante do projeto.

## Mensagens ao Usuario Final

- Toda mensagem automatica precisa respeitar:
  - idioma correto do projeto
  - tom consistente com a marca
  - clareza e objetividade
- Antes de subir mudancas em webhooks, automacoes ou mensagens outbound, revisar o texto final como se fosse uma mensagem real recebida pelo cliente.

## Validacao Antes de Deploy

- Confirmar se os textos automaticos estao no idioma correto.
- Confirmar se variaveis de ambiente criticas estao nomeadas corretamente.
- Confirmar se o endpoint usado em producao e o endpoint oficial mais recente.
- Rodar validacao de tipos antes de concluir a tarefa.

## Regra de Seguranca Operacional

- Nunca expor tokens, secrets ou credenciais em logs.
- Em logs estruturados, registrar apenas dados operacionais necessarios para diagnostico.

## Regra de Trabalho Futuro

- Se o usuario estiver falando em um idioma, mas o projeto estiver em outro, isso deve ser tratado como uma restricao explicita do projeto.
- Se essa informacao nao estiver 100% clara, perguntar antes de editar textos, mensagens, labels ou respostas do sistema.
