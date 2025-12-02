$path = "node_modules\react-native-track-player\android\src\main\java\com\doublesymmetry\trackplayer\module\MusicModule.kt"
$content = Get-Content $path -Raw
$content = $content.Replace("musicService.tracks[index].originalItem))", "musicService.tracks[index].originalItem ?: Bundle()))")
$content = $content.Replace("musicService.tracks[musicService.getCurrentTrackIndex()].originalItem", "musicService.tracks[musicService.getCurrentTrackIndex()].originalItem ?: Bundle()")
Set-Content -Path $path -Value $content -NoNewline
