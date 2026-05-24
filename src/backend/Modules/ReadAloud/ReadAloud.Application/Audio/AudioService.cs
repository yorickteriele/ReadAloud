using System;
using Microsoft.Extensions.Logging;

namespace ReadAloud.Application.Audio;

public class AudioService
{
    private readonly IAudioRepository _repository;
    private readonly ILogger<AudioService> _logger;

    public AudioService(IAudioRepository repository, ILogger<AudioService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<byte[]> TextToSpeechAsync(string text)
    {
        try
        {
            _logger.LogInformation("Generating speech for: {Text}", text);
            return await _repository.GenerateSpeechAsync(text);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating speech");
            throw;
        }
    }

    public async Task<byte[]> GenerateSpeechAsync(
        string text = "Hey",
        float temperature = 0.7f,
        float exaggeration = 1.3f,
        float cfgWeight = 0.5f,
        string language = "en",
        int? seed = null)
    {
        try
        {
            _logger.LogInformation(
                "Generating speech for: {Text} (temp={Temp}, exaggeration={Ex}, cfg={Cfg}, lang={Lang}, seed={Seed})",
                text, temperature, exaggeration, cfgWeight, language, seed);

            return await _repository.GenerateSpeechAsync(
                text,
                temperature,
                exaggeration,
                cfgWeight,
                language,
                seed);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating speech");
            throw;
        }
    }
}
