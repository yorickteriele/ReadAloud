using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using ReadAloud.Application.Audio;
using ReadAloud.Infrastructure.Requests;

namespace ReadAloud.Infrastructure.Repositories
{
    public class ChatterBoxAudioRepository : IAudioRepository
    {
        private readonly HttpClient _httpClient;

        public ChatterBoxAudioRepository(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _httpClient.BaseAddress = new Uri("http://localhost:8000");
            httpClient.Timeout = TimeSpan.FromMinutes(5);
        }

        public async Task<byte[]> GenerateSpeechAsync(string text = "Hey", float temperature = 0.7f, float exaggeration = 1.3f, float cfg_weight = 0.5f, string language = "en", int? seed = null)
        {
            var payload = new CustomTTSRequest
            {
                Text = text,
                Temperature = temperature,
                Exaggeration = exaggeration,
                CfgWeight = cfg_weight,
                Language = language,
                Seed = seed
            };

            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            };

            var json = JsonSerializer.Serialize(payload, options);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("/speech", content);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadAsByteArrayAsync();
        }
    }

}
