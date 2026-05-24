using System;

namespace Audio.Application.Services;

public interface IAudioRepository
{
    Task<byte[]> GenerateSpeechAsync(string text = "Hey", float temperature = 0.7f, float exaggeration = 1.3f, float cfg_weight = 0.5f, string language = "en", int? seed = null);
}
