using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ReadAloud.API.DTOs;
using ReadAloud.Application.Audio;

namespace ReadAloud.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AudioTestController : ControllerBase
    {

        private AudioService _audioService;
        private ILogger<AudioTestController> _logger;

        public AudioTestController(AudioService audioService, ILogger<AudioTestController> logger)
        {
            _audioService = audioService;
        }

        [HttpGet("test")]
        public async Task<IActionResult> Test()
        {
            Console.WriteLine("AudioTestController is working!");

            var audioBytes = await _audioService.GenerateSpeechAsync(text:"Lisa liep door het bos toen ze iets glinsterends tussen de bladeren zag.",
                    language: "nl");

            
            
            // optioneel: direct terugsturen als audio
            // System.IO.File.WriteAllBytes("output.wav", audioBytes);
            
            return File(audioBytes, "audio/wav", "output.wav");
        }

        [HttpPost("generate")]
        public async Task<IActionResult> Generate([FromBody] SpeechRequest request)
        {
            try
            {
                var audioBytes = await _audioService.GenerateSpeechAsync(
                    request.Text,
                    request.Temperature,
                    request.Exaggeration,
                    request.CfgWeight,
                    request.Language,
                    request.Seed
                );

                // optioneel: direct terugsturen als audio
                // System.IO.File.WriteAllBytes("output.wav", audioBytes);

                return File(audioBytes, "audio/wav", "output.wav");

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating speech");
                return StatusCode(500, "Error generating speech");
            }
        }
    }
}
