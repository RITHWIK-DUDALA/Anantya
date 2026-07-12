import os
import wave
import struct
import math

# Audio settings
sample_rate = 44100

def generate_tone(freq, duration, volume=0.5):
    num_samples = int(sample_rate * duration)
    samples = []
    for i in range(num_samples):
        # Sine wave with simple envelope (fade out to avoid clicks)
        t = float(i) / sample_rate
        # Envelope: 1.0 for first 80%, then linear fade to 0
        fade_start = 0.8 * num_samples
        if i > fade_start:
            env = 1.0 - (i - fade_start) / (num_samples - fade_start)
        else:
            env = 1.0
        
        value = int(volume * env * 32767.0 * math.sin(2.0 * math.pi * freq * t))
        samples.append(value)
    return samples

def generate_alarm(freq, duration, volume=0.5):
    num_samples = int(sample_rate * duration)
    samples = []
    for i in range(num_samples):
        t = float(i) / sample_rate
        # Square wave for harsher alarm sound
        val = 1.0 if math.sin(2.0 * math.pi * freq * t) > 0 else -1.0
        value = int(volume * 32767.0 * val)
        samples.append(value)
    return samples

def save_wav(filename, samples):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        for s in samples:
            wav_file.writeframes(struct.pack('h', s))

print("Generating success sound...")
# Success: Quick C6 -> E6 -> G6 -> C7 (arpeggio)
s_samples = []
s_samples.extend(generate_tone(1046.50, 0.1, 0.3)) # C6
s_samples.extend(generate_tone(1318.51, 0.1, 0.3)) # E6
s_samples.extend(generate_tone(1567.98, 0.1, 0.3)) # G6
s_samples.extend(generate_tone(2093.00, 0.5, 0.3)) # C7
save_wav('c:/Users/LENOVO/OneDrive/Desktop/janmastami/public/sounds/success.wav', s_samples)

print("Generating alarm sound...")
# Alarm: Alternating 400Hz and 600Hz harsh square waves
e_samples = []
for _ in range(4): # 4 cycles of alternating sounds (siren-like)
    e_samples.extend(generate_alarm(400, 0.25, 0.2))
    e_samples.extend(generate_alarm(600, 0.25, 0.2))
save_wav('c:/Users/LENOVO/OneDrive/Desktop/janmastami/public/sounds/alarm.wav', e_samples)

print("Done! Audio files created.")
