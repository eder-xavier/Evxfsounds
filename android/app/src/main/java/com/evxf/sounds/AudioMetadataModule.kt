package com.evxf.sounds

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.util.Base64
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream

class AudioMetadataModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AudioMetadataModule"
    }

    @ReactMethod
    fun getEmbeddedArtwork(uriString: String, promise: Promise) {
        try {
            val retriever = MediaMetadataRetriever()
            
            // Converte a URI string para um caminho que o retriever possa usar
            val uri = Uri.parse(uriString)
            val path = when {
                uri.scheme == "file" -> uri.path
                uri.scheme == "content" -> {
                    // Para content:// URIs, usa o retriever diretamente
                    retriever.setDataSource(reactApplicationContext, uri)
                    null
                }
                else -> uriString
            }
            
            if (path != null) {
                retriever.setDataSource(path)
            }
            
            // Extrai a arte embutida
            val art = retriever.embeddedPicture
            retriever.release()
            
            if (art != null) {
                // Converte para base64
                val base64 = Base64.encodeToString(art, Base64.NO_WRAP)
                promise.resolve("data:image/jpeg;base64,$base64")
            } else {
                promise.resolve(null)
            }
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to extract artwork: ${e.message}", e)
        }
    }

    @ReactMethod
    fun getEmbeddedArtworkAsFile(uriString: String, promise: Promise) {
        try {
            val retriever = MediaMetadataRetriever()
            
            val uri = Uri.parse(uriString)
            val path = when {
                uri.scheme == "file" -> uri.path
                uri.scheme == "content" -> {
                    retriever.setDataSource(reactApplicationContext, uri)
                    null
                }
                else -> uriString
            }
            
            if (path != null) {
                retriever.setDataSource(path)
            }
            
            val art = retriever.embeddedPicture
            retriever.release()
            
            if (art != null) {
                // Salva em arquivo temporário e retorna a URI
                val cacheDir = reactApplicationContext.cacheDir
                val artworkDir = File(cacheDir, "artwork")
                if (!artworkDir.exists()) {
                    artworkDir.mkdirs()
                }
                
                // Usa hash do URI como nome do arquivo para cache
                val fileName = "artwork_${uriString.hashCode()}.jpg"
                val file = File(artworkDir, fileName)
                
                if (!file.exists()) {
                    FileOutputStream(file).use { fos ->
                        fos.write(art)
                    }
                }
                
                promise.resolve("file://${file.absolutePath}")
            } else {
                promise.resolve(null)
            }
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to extract artwork: ${e.message}", e)
        }
    }

    @ReactMethod
    fun getAllMetadata(uriString: String, promise: Promise) {
        try {
            val retriever = MediaMetadataRetriever()
            
            val uri = Uri.parse(uriString)
            val path = when {
                uri.scheme == "file" -> uri.path
                uri.scheme == "content" -> {
                    retriever.setDataSource(reactApplicationContext, uri)
                    null
                }
                else -> uriString
            }
            
            if (path != null) {
                retriever.setDataSource(path)
            }
            
            val metadata = mutableMapOf<String, String?>()
            metadata["title"] = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_TITLE)
            metadata["artist"] = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_ARTIST)
            metadata["album"] = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_ALBUM)
            metadata["duration"] = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)
            metadata["year"] = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_YEAR)
            metadata["genre"] = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_GENRE)
            
            val art = retriever.embeddedPicture
            metadata["hasArtwork"] = (art != null).toString()
            
            retriever.release()
            
            promise.resolve(metadata)
        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to extract metadata: ${e.message}", e)
        }
    }
}
