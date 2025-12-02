# 📱 GUIA COMPLETO - ADICIONAR "EXCLUIR DO DISPOSITIVO"

## ✅ O QUE APLICAR

### 1. MusicContext.js
Arquivo: `MUSICCONTEXT_DELETE_FUNCTION.txt`
- Adicionar função `deleteFromDevice` após a função `deleteSong`
- Adicionar `deleteFromDevice` no Provider value

### 2. PlayerScreen.js  
Arquivo: `PLAYERSCREEN_FIXES.txt`
- Adicionar imports, est ados e useEffect para o slider
- Adicionar função `handleDeleteFromDevice`
- Trocar o Slider para usar estado local (sem delay)
- Adicionar CustomAlert no final do component

### 3. HomeScreen.js
**NÃO PRECISA MUDAR** - Já tem seleção múltipla e adicionar a playlist.
O botão "Excluir do Dispositivo" só aparece:
- No PlayerScreen (ao clicar nos 3 pontos)
- No PlaylistDetailScreen (ao visualizar uma música na playlist)

###4. PlaylistDetailScreen.js
Vou criar um arquivo específico para esta tela.

---

## 📄 RESUMO POR LOCAL

| Local | Ação | Arquivo de Referência |
|-------|------|------------------------|
| PlayerScreen | Ver música individual | `PLAYERSCREEN_FIXES.txt` |
| PlaylistDetailScreen | Ver música na playlist | `PLAYLISTDETAILSCREEN_FIXES.txt` (em breve) |
| HomeScreen | Não precisa | - |

---

## 💡 NOTA IMPORTANTE

O botão "Excluir do Dispositivo" **NÃO** deve aparecer na seleção múltipla do HomeScreen,
pois deletar múltiplos arquivos do dispositivo seria muito arriscado.

Apenas quando o usuário:
1. Abre uma música individual (PlayerScreen)
2. Vê uma música dentro de uma playlist (PlaylistDetail Screen)

---

**Próximos arquivos a criar:**
- ✅ MUSICCONTEXT_DELETE_FUNCTION.txt (Criado)
- ✅ PLAYERSCREEN_FIXES.txt (Criado)
- 🔄 PLAYLISTDETAILSCREEN_FIXES.txt (Criando...)
