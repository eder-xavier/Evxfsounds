# 🔧 Correções Pendentes - PlayerScreen e MusicContext

## ⚠️ PROBLEMA

Os arquivos `PlayerScreen.js` e `MusicContext.js` foram corrompidos durante as edições.
Precisam ser restaurados manualmente ou via git.

## ✅ CORREÇÕES A APLICAR

### 1. **Slider do PlayerScreen (delay/lag)**

**Problema:** oslider não responde bem porque está recebendo updates do `currentTime` muito rápido.

**Solução:**
```javascript
// No PlayerScreen.js, adicionar:

// Estado local para o slider
const [sliderValue, setSliderValue] = useState(0);
const [isSliding, setIsSliding] = useState(false);

// useEffect para atualizar quando NÃO está arrastando
useEffect(() => {
    if (!isSliding) {
        setSliderValue(currentTime);
    }
}, [currentTime, isSliding]);

// No JSX do Slider:
<Slider
    style={styles.slider}
    value={sliderValue}  // ← Usa estado local ao invés de currentTime
    minimumValue={0}
    maximumValue={duration || 1}
    onSlidingStart={() => setIsSliding(true)}  // ← Marca que está arrastando
    onValueChange={(value) => setSliderValue(value)}  // ← Atualiza localmente
    onSlidingComplete={(value) => {
        setIsSliding(false);  // ← Marca que parou de arrastar
        seekTo(value);  // ← Envia ao player
    }}
    minimumTrackTintColor={theme.progressBar}
    maximumTrackTintColor={theme.progressBg}
    thumbTintColor={theme.progressBar}
/>

// Tempo exibido também usa sliderValue:
<Text>{formatTime(sliderValue)}</Text>
```

### 2. **Deletar Música do Dispositivo (MusicContext)**

**Função a adicionar no `MusicContext.js`:**

```javascript
const deleteFromDevice = async (songId, songUri) => {
    try {
        // Para o player se estiver tocando esta música
        if (currentSong?.id === songId) {
            await TrackPlayer.reset();
            setCurrentSong(null);
        }
        
        // Deleta do dispositivo usando MediaLibrary
        const assets = await MediaLibrary.getAssetsAsync({
            mediaType: 'audio',
            first: 1,
        });

        const assetToDelete = assets.assets.find(a => a.id === songId);
        
        if (assetToDelete) {
            await MediaLibrary.deleteAssetsAsync([assetToDelete]);
        }
        
        // Remove da lista local
        const updatedSongs = songs.filter(s => s.id !== songId);
        setSongs(updatedSongs);
        
        // Remove das playlists
        const updatedPlaylists = playlists.map(pl => ({
            ...pl,
            songs: pl.songs.filter(s => s.id !== songId)
        }));
        setPlaylists(updatedPlaylists);
        await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
        
        // Remove da contagem de plays
        const newPlayCounts = { ...playCounts };
        delete newPlayCounts[songId];
        setPlayCounts(newPlayCounts);
        await AsyncStorage.setItem('playCounts', JSON.stringify(newPlayCounts));
        
        return true;
    } catch (error) {
        console.error('Error deleting from device:', error);
        return false;
    }
};
```

**Adicionar no Provider value:**
```javascript
<MusicContext.Provider
    value={{
        // ... outros valores ...
        deleteSong,
        deleteFromDevice,  // ← Adicionar aqui
        // ... resto ...
    }}
>
```

### 3. **UI do PlayerScreen para Delete**

**No PlayerScreen.js, adicionar:**

```javascript
// Imports
import { CustomAlert } from '../components/CustomAlert';

// Estado para alert
const [alertConfig, setAlertConfig] = useState({ 
    visible: false, 
    title: '', 
    message: '', 
    buttons: [] 
});

// Função helper
const showAlert = (title, message, buttons) => {
    setAlertConfig({ visible: true, title, message, buttons });
};

// Handler para deletar
const handleDeleteFromDevice = () => {
    setShowOptions(false);
    showAlert(
        'Excluir Arquivo',
        'Tem certeza que deseja DELETAR PERMANENTEMENTE este arquivo do dispositivo? Esta ação não pode ser desfeita!',
        [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Excluir Permanentemente',
                style: 'destructive',
                onPress: async () => {
                    const success = await deleteFromDevice(currentSong.id, currentSong.uri);
                    if (success) {
                        navigation.goBack();
                    } else {
                        showAlert('Erro', 'Não foi possível excluir o arquivo.');
                    }
                }
            }
        ]
    );
};

// No modal de opções, trocar botão "Excluir Música" por:
<TouchableOpacity
    style={styles.modalOption}
    onPress={handleDeleteFromDevice}
>
    <Ionicons name="trash-outline" size={24} color={theme.error} />
    <Text style={[styles.modalOptionText, { color: theme.error }]}>
        Excluir do Dispositivo
    </Text>
</TouchableOpacity>

// No final do component, antes do </View> final:
<CustomAlert
    visible={alertConfig.visible}
    title={alertConfig.title}
    message={alertConfig.message}
    buttons={alertConfig.buttons}
    onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
/>
```

## 🔄 PASSOS PARA CORRIGIR

1. **Restaurar arquivos corrompidos:**
   ```bash
   git checkout HEAD -- src/screens/PlayerScreen.js
   git checkout HEAD -- src/context/MusicContext.js
   ```

2. **Aplicar correções manualmente** seguindo os códigos acima

3. **Rebuild:**
   ```bash
   cd android
   .\gradlew.bat assembleRelease
   ```

## 📝 RESULTADO ESPERADO

- ✅ Slider do player responde instantaneamente
- ✅ Sem delay ao arrastar a barra de tempo
- ✅ Botão "Excluir do Dispositivo" no menu de opções da música
- ✅ Modal de confirmação funcional
- ✅ Arquivo deletado permanentemente do dispositivo

---

**Data:** 2025-12-02
**Versão:** 1.0.11
