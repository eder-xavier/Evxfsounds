import { NativeModules } from 'react-native';

const { AudioMetadataModule } = NativeModules;

/**
 * Extrai a arte do álbum embutida em um arquivo de áudio
 * @param {string} uri - URI do arquivo de áudio
 * @returns {Promise<string|null>} - Retorna data URI base64 da imagem ou null se não houver
 */
export const getEmbeddedArtwork = async (uri) => {
    if (!AudioMetadataModule) {
        console.warn('AudioMetadataModule not available');
        return null;
    }

    try {
        const artwork = await AudioMetadataModule.getEmbeddedArtwork(uri);
        return artwork;
    } catch (error) {
        console.error('Error getting embedded artwork:', error);
        return null;
    }
};

/**
 * Extrai a arte do álbum e salva em arquivo temporário
 * @param {string} uri - URI do arquivo de áudio
 * @returns {Promise<string|null>} - Retorna file:// URI ou null
 */
export const getEmbeddedArtworkAsFile = async (uri) => {
    if (!AudioMetadataModule) {
        console.warn('AudioMetadataModule not available');
        return null;
    }

    try {
        const artwork = await AudioMetadataModule.getEmbeddedArtworkAsFile(uri);
        return artwork;
    } catch (error) {
        console.error('Error getting embedded artwork as file:', error);
        return null;
    }
};

/**
 * Extrai todos os metadados do arquivo de áudio
 * @param {string} uri - URI do arquivo de áudio
 * @returns {Promise<object|null>} - Objeto com metadados ou null
 */
export const getAllMetadata = async (uri) => {
    if (!AudioMetadataModule) {
        console.warn('AudioMetadataModule not available');
        return null;
    }

    try {
        const metadata = await AudioMetadataModule.getAllMetadata(uri);
        return metadata;
    } catch (error) {
        console.error('Error getting metadata:', error);
        return null;
    }
};

export default {
    getEmbeddedArtwork,
    getEmbeddedArtworkAsFile,
    getAllMetadata,
};
