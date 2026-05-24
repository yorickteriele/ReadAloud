using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Audio.Application.Services;
using Audio.Infrastructure.Requests;

namespace Audio.Infrastructure.Repositories
{
    public class ChatterBoxAudioRepository : IAudioRepository
    {
        private readonly HttpClient _httpClient;

        public ChatterBoxAudioRepository(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            var baseUrl = configuration["ChatterBox:BaseUrl"] ?? "http://localhost:8000";
            _httpClient.BaseAddress = new Uri(baseUrl);
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
