using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ReadAloud.API.DTOs;
using ReadAloud.Application.Audio;

namespace ReadAloud.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SpeechController : ControllerBase
{
    private readonly AudioService _audioService;
    private readonly ILogger<SpeechController> _logger;

    public SpeechController(AudioService audioService, ILogger<SpeechController> logger)
    {
        _audioService = audioService;
        _logger = logger;
    }

    /// <summary>
    /// Converts text to speech and returns the audio file
    /// </summary>
    /// <param name="request">The speech generation request</param>
    /// <returns>Audio file in WAV format</returns>
    [HttpPost("convert")]
    public async Task<IActionResult> ConvertTextToSpeech([FromBody] SpeechRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Text))
        {
            return BadRequest(new { message = "Text is required" });
        }

        try
        {
            _logger.LogInformation("Converting text to speech for user {UserId}", User?.Identity?.Name);

            var audioBytes = await _audioService.GenerateSpeechAsync(
                request.Text,
                request.Temperature,
                request.Exaggeration,
                request.CfgWeight,
                request.Language,
                request.Seed
            );

            if (audioBytes == null || audioBytes.Length == 0)
            {
                _logger.LogError("Audio generation returned empty result");
                return StatusCode(500, new { message = "Failed to generate audio" });
            }

            _logger.LogInformation("Successfully generated {ByteCount} bytes of audio", audioBytes.Length);

            // Return as downloadable MP3/WAV file
            return File(audioBytes, "audio/wav", $"readaloud-{DateTime.UtcNow:yyyyMMddHHmmss}.wav");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error converting text to speech");
            return StatusCode(500, new { message = "An error occurred while generating speech" });
        }
    }
}
