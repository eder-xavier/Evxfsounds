# Evxf Sounds

Player de música desenvolvido com React Native e Expo.

## 🚀 Como rodar o projeto

Este projeto utiliza `react-native-track-player` para áudio em background, o que requer código nativo. Portanto, **não é possível executá-lo no Expo Go padrão**.

### Pré-requisitos

- Node.js
- Android Studio (para emulador ou build Android)
- JDK 17 ou superior
- Gradle configurado

### Passos

1.  Instale as dependências:
    ```bash
    npm install
    ```

2.  Gere o APK de release:
    ```bash
    cd android
    .\gradlew.bat assembleRelease
    ```
    
    O APK estará em: `android\app\build\outputs\apk\release\app-release.apk`

3.  Ou execute em modo desenvolvimento:
    ```bash
    npx expo run:android
    ```

4.  Inicie o servidor de desenvolvimento:
    ```bash
    npx expo start --dev-client
    ```

## 🌍 Internacionalização

O app suporta Português (pt), Inglês (en) e Francês (fr). As traduções estão em `src/constants/translations.js`.

## 🎵 Funcionalidades

### Reprodução de Música
- ✅ Reprodução de música local com suporte a artwork
- ✅ Controle em background com barra de progresso (TrackPlayer)
- ✅ Notificações de mídia com controles
- ✅ Artwork exibido em todas as telas (Player, MiniPlayer, Listas)
- ✅ MiniPlayer com gestos de swipe para fechar

### Navegação
- ✅ **Navegação por Swipe** - Deslize horizontalmente entre as abas (Músicas, Playlists, Mais Tocadas, Configurações)
- ✅ Navegação inferior com indicador visual
- ✅ Transições suaves e animadas

### Organização
- ✅ **Playlists** - Crie e gerencie suas playlists
  - Criação com múltiplas músicas de uma vez
  - Renomear e excluir playlists
  - Capa automática (primeira música da playlist)
  - Reordenar músicas (drag and drop)
  - Busca em tempo real
- ✅ **Top Played** - Músicas mais tocadas
- ✅ Ordenação por nome, data de adição ou modificação

### Busca e Filtros
- ✅ **Busca Interativa** nas telas de Músicas e Playlists
- ✅ Filtragem em tempo real
- ✅ Busca por título e artista

### Interface
- ✅ Temas (Claro/Escuro) com suporte a modo automático
- ✅ Alertas personalizados consistentes
- ✅ Modo de seleção múltipla
- ✅ Animações e transições suaves
- ✅ Design moderno e responsivo

### Controles de Reprodução
- ✅ Play/Pause, Próxima, Anterior
- ✅ Shuffle (aleatório)
- ✅ Repeat (repetir uma, todas, ou desligado)
- ✅ Seekbar (barra de progresso)
- ✅ Controle de volume

## 🛠️ Tecnologias Utilizadas

- **React Native** (0.76+) via Expo SDK 54
- **Expo** - Framework e ferramentas
- **React Navigation** - Navegação entre telas
  - Material Top Tabs - Para navegação com swipe
  - Stack Navigator - Para fluxo de telas
- **React Native Track Player** - Reprodução de áudio em background
- **Expo Media Library** - Acesso à biblioteca de músicas
- **AsyncStorage** - Persistência de dados
- **React Context API** - Gerenciamento de estado global

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── CustomAlert.js  # Alerta personalizado
│   ├── MiniPlayer.js   # Player minimizado
│   ├── SongItem.js     # Item de música na lista
│   └── Logo.js         # Logo do app
├── context/            # Contexts do React
│   ├── MusicContext.js    # Estado global da música
│   ├── ThemeContext.js    # Temas claro/escuro
│   └── LanguageContext.js # Internacionalização
├── screens/            # Telas do app
│   ├── HomeScreen.js         # Lista de músicas
│   ├── PlayerScreen.js       # Tela do player
│   ├── PlaylistsScreen.js    # Lista de playlists
│   ├── PlaylistDetailScreen.js # Detalhes da playlist
│   ├── TopPlayedScreen.js    # Mais tocadas
│   └── SettingsScreen.js     # Configurações
├── navigation/         # Navegação
│   └── AppNavigator.js
└── constants/          # Constantes
    ├── colors.js       # Cores e temas
    └── translations.js # Traduções
```

## 🔧 Configurações do Build

### Android
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 35 (Android 15)
- **Compile SDK**: 35
- **Kotlin**: 1.9.24
- **Build Tools**: 35.0.0 (automático)

### Dependências Principais
```json
{
  "@react-navigation/material-top-tabs": "^7.4.5",
  "@react-navigation/stack": "^7.6.8",
  "react-native-track-player": "^4.1.2",
  "expo-media-library": "~18.2.0",
  "@react-native-async-storage/async-storage": "2.2.0"
}
```

## 🐛 Soluções de Problemas Comuns

### Build Android falha
1. Pare todos os daemons: `.\gradlew.bat --stop`
2. Limpe o cache: `.\gradlew.bat clean`
3. Reconstrua: `.\gradlew.bat assembleRelease`

### Imagens não aparecem
As imagens agora são exibidas corretamente em todos os componentes com dimensões explícitas:
- PlayerScreen: 300x300 (width - 80)
- MiniPlayer: 40x40
- SongItem: 48x48
- PlaylistItem: 56x56

### App crashou após build
Verifique os logs com: `adb logcat *:E`

## 📝 Notas de Versão

### Versão 1.0.0 (Atual)
- ✅ Navegação por swipe implementada
- ✅ Busca interativa em Músicas e Playlists
- ✅ Criação de playlists com múltiplas músicas
- ✅ Capas de playlist automáticas
- ✅ Artwork persistente em todas as telas
- ✅ Alertas personalizados consistentes
- ✅ Correção de crashes e estabilidade

## 👨‍💻 Desenvolvimento

Desenvolvido por **Éder Xavier**

## 📄 Licença

Este projeto é de uso pessoal.
