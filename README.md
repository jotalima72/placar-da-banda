# Placar da banda

Aplicação React + Vite para Rock 'n' Roll Never Dies. Use o tablet na horizontal, preferencialmente em tela cheia. A configuração inicial usa as três composições de exemplo do manual e nomes genéricos; troque em **Configurar**.

## Executar

```sh
npm install
npm run dev
```

## Vercel

Importe este diretório como projeto. Se o repositório contiver também o manual, selecione `placar-da-banda` em **Root Directory**. Preset: **Vite**. Build: `npm run build`. Saída: `dist`. Não há variáveis de ambiente nem backend. Alternativamente, execute `npx vercel` neste diretório, na sua conta.

## Usar

- Configure integrantes (até 6), instrumento principal e setlist (até 8).
- Selecione uma faixa e ative pagando Coesão, ou use o Hino gratuito quando disponível.
- Cada integrante marca seu benefício de ritmo separadamente. Ritmos imediatos são registrados como aplicados.
- Registre Falha, Sucesso ou Ampliação de Solo e seu alvo. A tentativa é consumida em todos os resultados.
- Toque em um efeito para consumi-lo ou encerrar o acompanhamento. Condições seguem a duração do SWADE; o aplicativo não resolve turnos ou rolagens.
- **Próxima rodada** permite a próxima ativação. **Encerrar cena** recupera tentativas de Solo e Bis, sem recuperar Coesão nem o Hino usado na sessão.
- **Desfazer** recupera a última alteração. Exportar gera um JSON; Importar está em Configurar.

O estado é salvo no navegador deste aparelho. Não existe sincronização entre tablets. No Embalo exige descontar o Bene na ficha e só deve ser usado por quem tem a Vantagem. O aplicativo controla o uso, sem automatizar a ficha individual.

Em tablet horizontal com 4 integrantes e 3 músicas, a composição principal foi dimensionada para uma tela. Bandas com muitos integrantes, textos longos, setlists extensos ou telas pequenas podem precisar de mais espaço. Na vertical o layout permite rolagem para manter a leitura.

## Verificação

```sh
npm test
npm run build
```

Regras extraídas dos capítulos 02, 03, 05 e 09 do manual local.
