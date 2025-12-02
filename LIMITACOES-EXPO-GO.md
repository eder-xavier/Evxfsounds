# ⚠️ Limitações do Expo Go no Android

## Problema com Media Library no Android

Devido a mudanças nas permissões do Android (Android 13+), o **Expo Go não consegue mais fornecer acesso completo à biblioteca de mídia** do dispositivo.

### O que isso significa?

- **No Expo Go (Android 13+):** O app não conseguirá listar todas as músicas do dispositivo
- **No Expo Go (Android <13):** Funciona normalmente
- **No iOS:** Funciona normalmente no Expo Go
- **Em Development Build:** Funciona normalmente em todas as versões

### Soluções

#### Opção 1: Testar no iOS (Recomendado para testes rápidos)
Se você tiver um iPhone, teste no Expo Go do iOS, onde funciona perfeitamente.

#### Opção 2: Usar Android < 13
Se tiver um dispositivo Android com versão anterior ao Android 13, o Expo Go funcionará normalmente.

#### Opção 3: Criar um Development Build (Recomendado para produção)

Para ter acesso completo no Android 13+, você precisará criar um **development build**:

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Fazer login no Expo
eas login

# Configurar o projeto
eas build:configure

# Criar build de desenvolvimento para Android
eas build --profile development --platform android

# Instalar no dispositivo
# O comando acima gerará um APK que você pode instalar
```

Mais informações: https://docs.expo.dev/develop/development-builds/create-a-build

### Alternativa de Teste (Mock Data)

Se você quiser testar a interface sem acesso real às músicas, pode adicionar músicas de exemplo (mock) no código:

```javascript
// No MusicContext.js, método loadSongs
const loadSongs = async () => {
  try {
    // Músicas de exemplo para teste
    const mockSongs = [
      {
        id: '1',
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        title: 'Exemplo de Música 1',
        artist: 'Artista de Teste',
        duration: 180,
        album: 'Álbum de Teste',
        dateAdded: new Date(),
        dateModified: new Date(),
      },
      // Adicione mais músicas de exemplo...
    ];

    setSongs(sortSongs(mockSongs, sortBy));
  } catch (error) {
    console.error('Error loading songs:', error);
  }
};
```

### Status Atual

- ✅ **iOS no Expo Go:** Funcionando
- ✅ **Android <13 no Expo Go:** Funcionando
- ⚠️ **Android 13+ no Expo Go:** Limitado (necessita development build)
- ✅ **Development Build (todos):** Funcionando

### Recomendação

Para **desenvolvimento e testes iniciais:**
- Use iOS no Expo Go, OU
- Use músicas de exemplo (mock data)

Para **produção ou testes completos no Android:**
- Crie um development build com EAS

---

**Nota:** Este é um aviso conhecido do Expo. Não é um erro na implementação do app, mas uma limitação de segurança do Android 13+ que impede o Expo Go de acessar toda a biblioteca de mídia.
