# 🚀 Guia Rápido - Evxf Sounds

## Como Testar com Expo Go

### 1️⃣ Preparação
1. Abra o terminal nesta pasta do projeto
2. Execute: `npm start` ou `npx expo start`
3. Aguarde o QR code aparecer

### 2️⃣ No Seu Celular

#### Android:
1. Instale o app **Expo Go** da Play Store
2. Abra o Expo Go
3. Toque em **"Scan QR Code"**
4. Aponte a câmera para o QR code no terminal
5. Aguarde o app carregar

#### iOS:
1. Instale o app **Expo Go** da App Store
2. Abra o app **Câmera** nativo do iPhone
3. Aponte para o QR code no terminal
4. Toque na notificação do Expo que aparece
5. O Expo Go abrirá automaticamente

### 3️⃣ Permissões
- Na primeira execução, o app pedirá permissão para acessar suas músicas
- **Toque em "Permitir"** para que o app possa listar suas músicas

### 4️⃣ Se Não Houver Músicas
Se nenhuma música aparecer:
1. Certifique-se de ter músicas salvas no dispositivo
2. Vá para a aba "Configurações" (ícone de engrenagem)
3. Toque em "Atualizar Biblioteca"
4. Se ainda não funcionar, verifique as permissões do app nas configurações do dispositivo

## ✨ Funcionalidades para Testar

### 🎵 Player de Música
1. Na aba "Músicas", toque em qualquer música para começar a tocar
2. Toque no mini player na parte inferior para abrir o player completo
3. Experimente os controles: play/pause, próximo, anterior
4. Arraste a barra de progresso para navegar na música

### 📑 Playlists
1. Vá para a aba "Playlists"
2. Toque no botão "+" para criar uma nova playlist
3. Volte para "Músicas"
4. Mantenha pressionado em uma música
5. Selecione a playlist para adicionar

### 🎨 Tema
1. Vá para "Configurações"
2. Ative/desative o "Tema Escuro"
3. Veja a mudança de cores em tempo real!

### 🔀 Controles Avançados
No player completo:
- **Shuffle** (ícone de setas cruzadas): Toca músicas aleatoriamente
- **Repeat** (ícone de setas circulares):
  - Uma toque: Repete todas as músicas
  - Dois toques: Repete apenas a música atual (aparece um "1")
  - Três toques: Desliga a repetição

## 🔍 Ordenação de Músicas
1. Na tela "Músicas", toque no ícone de filtro (funil)
2. Escolha como ordenar:
   - **Nome**: Ordem alfabética
   - **Data de Adição**: Músicas mais recentes primeiro
   - **Data de Modificação**: Por última modificação

## ⚠️ Solução de Problemas Rápidos

### O QR code não aparece
- Aguarde alguns segundos, o Metro está compilando
- Se demorar muito, pressione `Ctrl+C` e tente `npx expo start -c`

### Erro "Unable to resolve module"
```bash
npx expo start -c
```

### App não carrega no celular
- Certifique-se que o PC e celular estão na **mesma rede Wi-Fi**
- Desative VPNs temporariamente
- Tente fechar e reabrir o Expo Go

### Nenhuma música aparece
1. Conceda permissões quando solicitado
2. Verifique se há músicas no dispositivo em formatos suportados (.mp3, .m4a, etc.)
3. Tente "Atualizar Biblioteca" nas configurações

## 📱 Comandos Úteis

```bash
# Iniciar normalmente
npm start

# Iniciar com cache limpo
npx expo start -c

# Iniciar e abrir no navegador (para testes web)
npx expo start --web

# Parar o servidor
Ctrl + C
```

## 🎨 Cores do Tema

### Claro
- Indigo (#4F46E5)
- Cyan (#06B6D4)
- Verde (#10B981)

### Escuro
- Indigo (#6366F1)
- Cyan (#22D3EE)
- Verde (#34D399)

---

**Aproveite o Evxf Sounds!** 🎵

Se tiver dúvidas, consulte o `README.md` completo.
