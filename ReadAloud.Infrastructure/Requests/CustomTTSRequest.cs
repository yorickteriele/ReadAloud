using System;
using System.Text.Json.Serialization;

namespace ReadAloud.Infrastructure.Requests;

public class CustomTTSRequest
    {
        [JsonPropertyName("text")]
        public required string Text { get; set; }

        [JsonPropertyName("temperature")]
        public float Temperature { get; set; }

        [JsonPropertyName("exaggeration")]
        public float Exaggeration { get; set; }

        [JsonPropertyName("cfg_weight")]
        public float CfgWeight { get; set; }

        [JsonPropertyName("seed")]
        public int? Seed { get; set; }

        [JsonPropertyName("speed_factor")]
        public float? SpeedFactor { get; set; }

        [JsonPropertyName("language_id")]
        public string Language { get; set; }
    }
