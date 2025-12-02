# 🏗️ Arquitetura Técnica - Evxf Sounds

## Visão Geral

O Evxf Sounds é construído seguindo os princípios de **componentização**, **separação de responsabilidades** e **gerenciamento de estado centralizado**.

## 📐 Arquitetura

```
┌─────────────────────────────────────┐
│           App.js (Root)             │
│  ┌──────────────────────────────┐   │
│  │   SafeAreaProvider           │   │
│  │  ┌────────────────────────┐  │   │
│  │  │   ThemeProvider        │  │   │
│  │  │  ┌──────────────────┐  │  │   │
│  │  │  │  MusicProvider   │  │  │   │
│  │  │  │  ┌────────────┐  │  │  │   │
│  │  │  │  │ Navigator  │  │  │  │   │
│  │  │  │  └────────────┘  │  │  │   │
│  │  │  └──────────────────┘  │  │   │
│  │  └────────────────────────┘  │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

## 🎯 Contextos (Context API)

### ThemeContext
**Responsabilidade:** Gerenciar o tema da aplicação (claro/escuro)

**Estado:**
```javascript
{
  theme: Object,        // Objeto com todas as cores do tema atual
  isDarkMode: Boolean,  // Indica se está em modo escuro
  toggleTheme: Function,// Alterna entre claro e escuro
  isLoading: Boolean    // Indica se está carregando o tema salvo
}
```

**Persistência:** AsyncStorage (chave: 'theme')

**Uso:**
```javascript
const { theme, isDarkMode, toggleTheme } = useTheme();
```

---

### MusicContext
**Responsabilidade:** Gerenciar todo o estado e lógica do player de música

**Estado Principal:**
```javascript
{
  // Biblioteca
  songs: Array,              // Lista de todas as músicas
  hasPermission: Boolean,    // Status da permissão de mídia
  sortBy: String,           // 'name' | 'dateAdded' | 'dateModified'
  
  // Playback
  currentSong: Object,       // Música atual tocando
  isPlaying: Boolean,        // Estado de reprodução
  currentTime: Number,       // Posição atual (segundos)
  duration: Number,          // Duração total (segundos)
  sound: Sound,              // Objeto de áudio do Expo AV
  
  // Controles
  repeatMode: String,        // 'off' | 'all' | 'one'
  shuffle: Boolean,          // Estado do shuffle
  
  // Playlists
  playlists: Array,          // Lista de playlists do usuário
}
```

**Métodos Principais:**
```javascript
{
  // Playback
  playSong(song),           // Toca uma música
  togglePlayPause(),        // Play/Pause
  playNext(),               // Próxima música
  playPrevious(),           // Música anterior
  seekTo(position),         // Navega para posição
  
  // Configurações
  toggleRepeat(),           // Alterna modo de repetição
  toggleShuffle(),          // Alterna shuffle
  changeSortBy(sortType),   // Muda ordenação
  
  // Playlists
  createPlaylist(name),     // Cria nova playlist
  addToPlaylist(id, song),  // Adiciona música à playlist
  removeFromPlaylist(id, songId),  // Remove música
  deletePlaylist(id),       // Deleta playlist
  
  // Sistema
  requestPermissions(),     // Solicita permissões
  loadSongs(),             // Recarrega biblioteca
}
```

**Persistência:** 
- Playlists: AsyncStorage (chave: 'playlists')
- Estado do player: Não persiste (reinicia a cada sessão)

---

## 🧩 Componentes

### MiniPlayer
**Localização:** `src/components/MiniPlayer.js`

**Props:**
- `onPress`: Função chamada ao tocar no mini player

**Funcionalidade:**
- Exibe informações da música atual
- Controles básicos (play/pause, próximo)
- Fica fixo na parte inferior da tela
- Só aparece quando há música tocando

**Dependências:**
- `useTheme()` - Para cores
- `useMusic()` - Para dados do player

---

### SongItem
**Localização:** `src/components/SongItem.js`

**Props:**
```javascript
{
  song: Object,           // Objeto da música
  onPress: Function,      // Ao tocar
  onLongPress: Function,  // Ao pressionar longamente
  isPlaying: Boolean      // Se é a música atual
}
```

**Funcionalidade:**
- Representa uma música na lista
- Visual diferenciado para música tocando
- Menu de opções (long press)

---

## 📱 Telas (Screens)

### HomeScreen
**Rota:** `Main -> Home`

**Funcionalidades:**
- Lista todas as músicas do dispositivo
- Menu de ordenação
- Menu de opções por música (long press)
- Adicionar música à playlist

**Componentes usados:**
- `SongItem` - Para cada música
- Modals personalizados para menus

---

### PlayerScreen
**Rota:** `Player` (Modal)

**Funcionalidades:**
- Player em tela cheia
- Artwork grande
- Barra de progresso interativa
- Controles completos
- Shuffle e Repeat

**Apresentação:** Modal que sobrepõe a tela principal

---

### PlaylistsScreen
**Rota:** `Main -> Playlists`

**Funcionalidades:**
- Lista todas as playlists
- Criar nova playlist
- Deletar playlist (long press)
- Navegar para detalhes

---

### PlaylistDetailScreen
**Rota:** `PlaylistDetail`

**Funcionalidades:**
- Exibe músicas de uma playlist
- Tocar músicas da playlist
- Remover músicas (long press)

**Parâmetros de rota:**
- `playlist` - Objeto da playlist

---

### SettingsScreen
**Rota:** `Main -> Settings`

**Funcionalidades:**
- Toggle tema claro/escuro
- Atualizar biblioteca de músicas
- Ver status de permissões
- Informações do app

---

## 🧭 Navegação

### Estrutura

```
Stack Navigator (Root)
├── Main (Bottom Tabs)
│   ├── Home (HomeScreen)
│   ├── Playlists (PlaylistsScreen)
│   └── Settings (SettingsScreen)
├── Player (PlayerScreen) - Modal
└── PlaylistDetail (PlaylistDetailScreen)
```

### Tipo de Navegação

**Bottom Tabs:**
- Músicas, Playlists, Configurações
- Sempre visível (exceto em modals)

**Stack (Modal):**
- Player em tela cheia
- Detalhe da playlist

### Navegação Programática

```javascript
// Abrir player
navigation.navigate('Player');

// Abrir playlist
navigation.navigate('PlaylistDetail', { playlist });

// Voltar
navigation.goBack();
```

---

## 🎨 Sistema de Cores

### Estrutura
```javascript
COLORS = {
  light: { /* cores do tema claro */ },
  dark: { /* cores do tema escuro */ }
}
```

### Tokens de Cor Principais
```javascript
{
  primary,          // Cor principal (Indigo)
  secondary,        // Cor secundária (Cyan)
  accent,          // Cor de destaque (Verde)
  background,      // Fundo da tela
  surface,         // Fundo de cards/componentes
  text,            // Texto principal
  textSecondary,   // Texto secundário
  border,          // Bordas
  // ... cores específicas de componentes
}
```

### Uso
```javascript
const { theme } = useTheme();

<View style={{ backgroundColor: theme.background }}>
  <Text style={{ color: theme.text }}>Texto</Text>
</View>
```

---

## 📦 Dependências Principais

### Expo Packages
- **expo-av**: Reprodução de áudio
- **expo-media-library**: Acesso à biblioteca de mídia
- **expo-linear-gradient**: Gradientes (opcional para futuro)

### React Native Community
- **@react-native-async-storage/async-storage**: Persistência local
- **@react-native-community/slider**: Controle deslizante

### React Navigation
- **@react-navigation/native**: Base da navegação
- **@react-navigation/bottom-tabs**: Abas inferiores
- **@react-navigation/stack**: Navegação em pilha

---

## 🔄 Fluxo de Dados

### Carregamento Inicial
```
App Start
    ↓
Load Theme (AsyncStorage)
    ↓
Request Media Permissions
    ↓
Load Songs (if permission granted)
    ↓
Load Playlists (AsyncStorage)
    ↓
Render UI
```

### Reprodução de Música
```
User taps song
    ↓
playSong(song)
    ↓
Unload current sound (if exists)
    ↓
Create new Sound object
    ↓
Set playback status callback
    ↓
Update state (currentSong, isPlaying)
    ↓
UI re-renders
```

### Gerenciamento de Playlist
```
Create Playlist
    ↓
Generate unique ID
    ↓
Add to playlists array
    ↓
Save to AsyncStorage
    ↓
Update state
    ↓
UI updates
```

---

## 🛡️ Tratamento de Erros

### Permissões
```javascript
try {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') {
    // Mostrar mensagem ao usuário
  }
} catch (error) {
  console.error('Error requesting permissions:', error);
}
```

### Reprodução de Áudio
```javascript
try {
  await sound.playAsync();
} catch (error) {
  console.error('Error playing song:', error);
  // Tentar próxima música ou mostrar erro
}
```

### AsyncStorage
```javascript
try {
  await AsyncStorage.setItem('key', value);
} catch (error) {
  console.error('Error saving data:', error);
  // Continuar sem persistência
}
```

---

## 🚀 Performance

### Otimizações Implementadas
1. **FlatList**: Renderização lazy de listas grandes
2. **useCallback**: Memoização de funções em contextos
3. **Sound cleanup**: Liberação de recursos ao desmontar

### Melhorias Futuras
- [ ] Virtualização de listas muito grandes (>1000 itens)
- [ ] Debounce na barra de progresso
- [ ] Lazy loading de artwork
- [ ] Caching de metadados de música

---

## 📝 Convenções de Código

### Nomenclatura
- **Componentes**: PascalCase (ex: `MiniPlayer`)
- **Arquivos**: Mesmo nome do componente principal
- **Funções**: camelCase (ex: `playSong`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `FONT_SIZES`)

### Estrutura de Componentes
```javascript
import ... // Imports

export const ComponentName = ({ props }) => {
  // Hooks
  // Estados
  // Efeitos
  // Funções
  // Render helpers
  // Return JSX
};

const styles = StyleSheet.create({...});
```

### Contextos
```javascript
const Context = createContext();

export const Provider = ({ children }) => {
  // Estado e lógica
  return <Context.Provider value={...}>{children}</Context.Provider>;
};

export const useContext = () => {
  const context = useContext(Context);
  if (!context) throw new Error('...');
  return context;
};
```

---

## 🔐 Permissões

### Android (API 33+)
- `READ_MEDIA_AUDIO` - Leitura de áudio
- `READ_EXTERNAL_STORAGE` - Leitura (legado)

### iOS
- `NSAppleMusicUsageDescription` - Biblioteca de música
- `NSMediaLibraryUsageDescription` - Biblioteca de mídia

### Solicitação
- Primeira execução: Automática ao carregar músicas
- Manual: Botão nas configurações

---

Esta documentação cobre a arquitetura atual do projeto. Para implementações futuras, consulte o roadmap no README.md.
