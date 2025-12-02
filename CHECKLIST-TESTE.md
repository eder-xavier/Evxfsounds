# ✅ Checklist de Teste - Evxf Sounds

Use este checklist para testar todas as funcionalidades do app no Expo Go.

---

## 🚀 Inicialização

- [ ] Servidor iniciado com `npm start`
- [ ] QR code visível no terminal
- [ ] App aberto no Expo Go
- [ ] App carregou sem erros
- [ ] Permissão de mídia concedida

---

## 🏠 Tela Inicial (Músicas)

### Visualização
- [ ] Lista de músicas carregada
- [ ] Título das músicas exibido corretamente
- [ ] Artistas exibidos (ou "Unknown Artist")
- [ ] Duração das músicas formatada (MM:SS)
- [ ] Contador de músicas exibido

### Interações
- [ ] Tocar em uma música inicia a reprodução
- [ ] Mini player aparece na parte inferior
- [ ] Música atual destacada na lista
- [ ] Long press em música abre menu de opções

### Ordenação
- [ ] Botão de filtro (funil) visível
- [ ] Menu de ordenação abre ao tocar no filtro
- [ ] Ordenação por Nome funciona
- [ ] Ordenação por Data de Adição funciona
- [ ] Ordenação por Data de Modificação funciona
- [ ] Ícone de checkmark aparece na opção selecionada

---

## 🎵 Mini Player

### Visualização
- [ ] Aparece quando música está tocando
- [ ] Mostra artwork (ícone de notas musicais)
- [ ] Título da música exibido
- [ ] Artista exibido
- [ ] Botões de controle visíveis

### Controles
- [ ] Botão Play/Pause funciona
- [ ] Ícone muda entre play e pause
- [ ] Botão de próxima música funciona
- [ ] Tocar no mini player abre player completo

---

## 📱 Player Completo (Tela Cheia)

### Navegação
- [ ] Abre ao tocar no mini player
- [ ] Animação de modal suave
- [ ] Botão de fechar (chevron down) visível
- [ ] Fechar retorna à tela anterior

### Visualização
- [ ] Artwork grande exibido
- [ ] Título da música centralizado
- [ ] Artista exibido abaixo do título
- [ ] Barra de progresso visível
- [ ] Tempo atual exibido (00:00)
- [ ] Tempo total exibido (00:00)
- [ ] Controles principais visíveis

### Barra de Progresso
- [ ] Arrasta suavemente
- [ ] Música pula para posição arrastada
- [ ] Atualiza automaticamente durante reprodução
- [ ] Valores de tempo atualizados

### Controles de Reprodução
- [ ] Botão anterior funciona
- [ ] Botão play/pause funciona
- [ ] Ícone atualiza corretamente
- [ ] Botão próximo funciona
- [ ] Transição entre músicas suave

### Shuffle
- [ ] Ícone de shuffle visível
- [ ] Ativa/desativa ao tocar
- [ ] Cor muda quando ativado (primária)
- [ ] Músicas tocam aleatoriamente quando ativo

### Repeat
- [ ] Ícone de repeat visível
- [ ] Três modos funcionam:
  - [ ] Off (ícone cinza)
  - [ ] All (ícone colorido)
  - [ ] One (ícone colorido + badge "1")
- [ ] Comportamento correto:
  - [ ] Off: Para no final da lista
  - [ ] All: Reinicia a lista
  - [ ] One: Repete a mesma música

---

## 📑 Playlists

### Tela de Playlists
- [ ] Aba "Playlists" acessível
- [ ] Lista de playlists vazia inicialmente
- [ ] Mensagem de "Nenhuma playlist criada"
- [ ] Botão + visível no topo

### Criar Playlist
- [ ] Botão + abre modal de criação
- [ ] Campo de texto focado automaticamente
- [ ] Placeholder visível
- [ ] Botão "Cancelar" funciona
- [ ] Botão "Criar" funciona
- [ ] Playlist aparece na lista
- [ ] Alert de sucesso exibido

### Listar Playlists
- [ ] Ícone de playlist exibido
- [ ] Nome da playlist visível
- [ ] Contador de músicas exibido
- [ ] Chevron (seta) à direita
- [ ] Tocar abre detalhes
- [ ] Long press oferece deletar

### Deletar Playlist
- [ ] Long press mostra confirmação
- [ ] Alert com nome da playlist
- [ ] Botão "Cancelar" funciona
- [ ] Botão "Excluir" remove playlist
- [ ] Playlist removida da lista

---

## 📝 Detalhe da Playlist

### Navegação
- [ ] Abre ao tocar em uma playlist
- [ ] Botão voltar funciona
- [ ] Nome da playlist no topo

### Visualização
- [ ] Ícone grande da playlist
- [ ] Nome centralizado
- [ ] Contador de músicas
- [ ] Lista de músicas (se houver)
- [ ] Mensagem se vazia

### Músicas na Playlist
- [ ] Músicas listadas corretamente
- [ ] Tocar em música inicia reprodução
- [ ] Música atual destacada
- [ ] Long press oferece remover

### Remover Música
- [ ] Long press mostra confirmação
- [ ] Alert com nome da música
- [ ] Botão "Remover" funciona
- [ ] Música removida da playlist
- [ ] Contador atualizado

---

## 🎵 Adicionar Música à Playlist

### Menu de Música (Home)
- [ ] Long press em música abre menu
- [ ] Título da música exibido
- [ ] Seção "Adicionar à playlist" visível
- [ ] Playlists listadas (se existirem)
- [ ] Botão "Cancelar" visível

### Adicionar
- [ ] Tocar em playlist adiciona música
- [ ] Alert de sucesso exibido
- [ ] Menu fecha automaticamente
- [ ] Música aparece na playlist

---

## ⚙️ Configurações

### Tela de Configurações
- [ ] Aba "Configurações" acessível
- [ ] Título exibido
- [ ] Seções organizadas

### Seção Aparência
- [ ] Título "APARÊNCIA" exibido
- [ ] Item "Tema Escuro" visível
- [ ] Ícone (lua/sol) correto
- [ ] Switch funciona
- [ ] Tema muda imediatamente

### Tema Claro
- [ ] Background claro
- [ ] Textos escuros
- [ ] Cores primárias visíveis (Indigo, Cyan, Verde)
- [ ] Contraste adequado

### Tema Escuro
- [ ] Background escuro
- [ ] Textos claros
- [ ] Cores primárias mais claras
- [ ] Contraste adequado
- [ ] Todos elementos visíveis

### Persistência de Tema
- [ ] Fechar e reabrir app mantém tema
- [ ] Tema salvo corretamente

### Seção Biblioteca
- [ ] Título "BIBLIOTECA" exibido
- [ ] Item "Atualizar Biblioteca" visível
- [ ] Ícone de refresh
- [ ] Tocar recarrega músicas
- [ ] Item "Permissão de Mídia" visível
- [ ] Status correto (Concedida/Não Concedida)
- [ ] Cor verde se concedida
- [ ] Cor vermelha se não concedida

### Seção Sobre
- [ ] Título "SOBRE" exibido
- [ ] Item "Versão" mostra "1.0.0"
- [ ] Item "Evxf Sounds" visível
- [ ] Subtítulo "Player de Música"

### Rodapé
- [ ] "Desenvolvido com ❤️" visível
- [ ] "© 2025 Evxf Sounds" visível
- [ ] Centralizado

---

## 🎨 Design e UX

### Cores
- [ ] Paleta consistente em todo app
- [ ] Indigo como cor principal
- [ ] Cyan como secundária
- [ ] Verde como accent
- [ ] Boa legibilidade

### Ícones
- [ ] Todos ícones carregados
- [ ] Tamanhos adequados
- [ ] Cores corretas
- [ ] Ionicons funcionando

### Navegação
- [ ] Bottom tabs sempre visíveis (exceto em modals)
- [ ] Ícones de tabs corretos
- [ ] Tab ativa destacada
- [ ] Labels claras
- [ ] Transições suaves

### Responsividade
- [ ] Layouts adaptados à tela
- [ ] Textos não cortados
- [ ] Botões tocáveis
- [ ] Margens adequadas
- [ ] Safe area respeitada

---

## 🔄 Fluxos Completos

### Fluxo: Primeira Música
1. - [ ] Abrir app
2. - [ ] Conceder permissões
3. - [ ] Ver lista de músicas
4. - [ ] Tocar em uma música
5. - [ ] Mini player aparece
6. - [ ] Música toca
7. - [ ] Abrir player completo
8. - [ ] Controlar reprodução

### Fluxo: Criar e Usar Playlist
1. - [ ] Ir para Playlists
2. - [ ] Criar nova playlist
3. - [ ] Voltar para Músicas
4. - [ ] Long press em música
5. - [ ] Adicionar à playlist
6. - [ ] Voltar para Playlists
7. - [ ] Abrir playlist
8. - [ ] Ver música adicionada
9. - [ ] Tocar música da playlist

### Fluxo: Mudar Tema
1. - [ ] Ir para Configurações
2. - [ ] Ativar tema escuro
3. - [ ] Verificar mudança visual
4. - [ ] Navegar entre telas
5. - [ ] Verificar consistência
6. - [ ] Fechar app
7. - [ ] Reabrir app
8. - [ ] Tema permanece escuro

---

## 🐛 Testes de Erro

### Sem Músicas
- [ ] Mensagem adequada se não há músicas
- [ ] Sugestão de adicionar músicas
- [ ] App não crasheia

### Sem Permissões
- [ ] Mensagem se permissão negada
- [ ] Botão para solicitar novamente
- [ ] Status exibido em Configurações

### Sem Internet
- [ ] App funciona offline
- [ ] Músicas locais tocam normalmente

### Playlist Vazia
- [ ] Mensagem adequada
- [ ] Instruções claras
- [ ] App não crasheia

---

## 📊 Performance

- [ ] App inicia rapidamente
- [ ] Listas rolam suavemente
- [ ] Sem lag ao trocar músicas
- [ ] Sem lag ao trocar tema
- [ ] Memória estável
- [ ] Bateria não drena excessivamente

---

## ✅ Resultado Final

**Total de itens testados:** ___ / ___

**Status geral:**
- [ ] ✅ Aprovado - Tudo funcionando
- [ ] ⚠️ Parcial - Alguns problemas menores
- [ ] ❌ Reprovado - Problemas críticos

**Problemas encontrados:**
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

**Observações:**
_________________________________________________
_________________________________________________
_________________________________________________

---

**Testado por:** _______________
**Data:** _______________
**Dispositivo:** _______________
**Sistema:** Android / iOS (versão: _______)
