const frameSize = 512
const updateInterval = 16
const vadCommitSeconds = 10

/**
 * Global settings for MoonshineJS.
 */
export const Settings = {
    FRAME_SIZE: frameSize, // as specified by silero v5; changing this is not recommended
    STREAM_UPDATE_INTERVAL: updateInterval,
    STREAM_COMMIT_MIN_INTERVAL: updateInterval * 4,
    STREAM_COMMIT_MAX_INTERVAL: updateInterval * 8,
    STREAM_COMMIT_EMA_THRESHOLD: 0.5,
    STREAM_COMMIT_EMA_PERIOD: 5,
    VAD_COMMIT_INTERVAL: Math.ceil((vadCommitSeconds * 10000) / frameSize),
    // Daily Routine English: padrões trocados por caminhos locais (o original apontava para
    // download.moonshine.ai e cdn.jsdelivr.net). O worker do app define os caminhos na inicialização.
    BASE_ASSET_PATH: {
        MOONSHINE: "./",
        ONNX_RUNTIME: "./",
        SILERO_VAD: "./"
    },
    VERBOSE_LOGGING: false
}
