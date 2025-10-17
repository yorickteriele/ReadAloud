using System;

namespace ReadAloud.API.DTOs;

public class SpeechRequest
{
    public string Text { get; set; } = "Hey";
    public float Temperature { get; set; } = 0.7f;
    public float Exaggeration { get; set; } = 1.3f;
    public float CfgWeight { get; set; } = 0.5f;
    public string Language { get; set; } = "en";
    public int? Seed { get; set; }
}
