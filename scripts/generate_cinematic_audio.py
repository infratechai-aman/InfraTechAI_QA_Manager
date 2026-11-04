import os
import subprocess
import numpy as np
import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
VOICE_FILE = "mughal_narration_60s.mp3"
OUTPUT_AUDIO = "mughal_cinematic_audio.wav"

# Get voice duration
cmd = [FFMPEG, '-i', VOICE_FILE]
p = subprocess.run(cmd, stderr=subprocess.PIPE, text=True)
duration = 68.0
for line in p.stderr.splitlines():
    if 'Duration' in line:
        parts = line.split('Duration:')[1].split(',')[0].strip().split(':')
        duration = float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
        break

print(f"Voice Duration: {duration:.2f} seconds")

# Audio synthesis parameters
sample_rate = 44100
total_samples = int(duration * sample_rate)
time = np.linspace(0, duration, total_samples, endpoint=False)

# 1. Dark Cinematic Ambient Drone (D Minor: D1=36.71Hz, A1=55Hz, D2=73.42Hz)
drone = (
    0.15 * np.sin(2 * np.pi * 36.71 * time) +
    0.12 * np.sin(2 * np.pi * 55.00 * time) +
    0.08 * np.sin(2 * np.pi * 73.42 * time + 0.5) +
    0.05 * np.sin(2 * np.pi * 110.00 * time + 1.0)
)
# Add slow modulation
drone *= (0.7 + 0.3 * np.sin(2 * np.pi * 0.1 * time))

# 2. Epic Taiko Battle Drums & Cannon Impacts
drums = np.zeros(total_samples)

def add_impact(t_sec, intensity=1.0, is_cannon=False):
    idx = int(t_sec * sample_rate)
    dur = 2.5 if is_cannon else 1.2
    n_samples = min(int(dur * sample_rate), total_samples - idx)
    if n_samples <= 0 or idx >= total_samples:
        return
    t_imp = np.linspace(0, dur, n_samples)
    if is_cannon:
        # Deep explosive boom with noise & sub-drop
        f_start = 110.0
        f_end = 28.0
        freqs = np.linspace(f_start, f_end, n_samples)
        phase = 2 * np.pi * np.cumsum(freqs) / sample_rate
        sub = np.sin(phase)
        noise = (np.random.rand(n_samples) - 0.5) * 1.5
        env = np.exp(-t_imp * 3.5)
        sound = (sub * 0.7 + noise * 0.5) * env * intensity
    else:
        # Taiko hit
        f_start = 90.0
        f_end = 42.0
        freqs = np.linspace(f_start, f_end, n_samples)
        phase = 2 * np.pi * np.cumsum(freqs) / sample_rate
        env = np.exp(-t_imp * 4.0)
        sound = np.sin(phase) * env * intensity
    drums[idx:idx + n_samples] += sound

# Act 1: Cannons of Panipat
add_impact(2.5, 0.9, is_cannon=False) # Battle march
add_impact(5.5, 1.2, is_cannon=True)  # Cannon 1
add_impact(8.2, 1.3, is_cannon=True)  # Cannon 2
add_impact(11.0, 1.4, is_cannon=True) # Cannon 3
add_impact(13.8, 1.1, is_cannon=False)

# Act 2: Imperial Grandeur (orchestral pulse)
for t in [17.0, 20.5, 24.0, 27.5, 31.0, 34.5]:
    add_impact(t, 0.7, is_cannon=False)

# Act 3: Deccan War Drums
for t in [38.0, 41.2, 44.5, 47.8, 51.0]:
    add_impact(t, 1.1, is_cannon=False)
add_impact(43.0, 1.2, is_cannon=True) # Siege cannon
add_impact(49.5, 1.2, is_cannon=True) # Siege explosion

# Act 4: Fall of Delhi (heavy sorrow impact)
add_impact(55.0, 1.3, is_cannon=False)
add_impact(62.0, 0.9, is_cannon=False)

# 3. Cinematic Strings Chord Swells (D min -> Bb maj -> G min -> A min)
strings = np.zeros(total_samples)
chord_prog = [
    # (start_s, end_s, [freqs])
    (0.0, 17.0, [146.83, 174.61, 220.00]),       # D minor
    (17.0, 35.0, [174.61, 220.00, 261.63, 329.63]), # F Maj / D Golden
    (35.0, 52.0, [116.54, 146.83, 174.61]),      # Bb Dark
    (52.0, duration, [110.00, 130.81, 164.81])   # A minor twilight
]

for s_t, e_t, freqs in chord_prog:
    idx_s = int(s_t * sample_rate)
    idx_e = min(int(e_t * sample_rate), total_samples)
    dur_c = e_t - s_t
    t_c = np.linspace(0, dur_c, idx_e - idx_s)
    # Smooth fade in and fade out
    env_c = np.sin(np.pi * np.linspace(0, 1, idx_e - idx_s))
    chord_wave = np.zeros(idx_e - idx_s)
    for f in freqs:
        chord_wave += 0.04 * np.sin(2 * np.pi * f * t_c)
        chord_wave += 0.02 * np.sin(2 * np.pi * f * 2 * t_c) # harmonic
    strings[idx_s:idx_e] += chord_wave * env_c

# Combine background music mix
bg_music = (drone * 0.35 + drums * 0.45 + strings * 0.4)
bg_music = np.clip(bg_music, -0.9, 0.9)

# Export background music to WAV
import wave

# Write 16-bit PCM WAV
bg_int16 = (bg_music * 32767).astype(np.int16)
with wave.open("bg_music.wav", "wb") as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(sample_rate)
    wf.writeframes(bg_int16.tobytes())

print("Background music generated: bg_music.wav")

# Now mix voice + bg_music with ffmpeg (ducking background music by -12dB under voice)
cmd_mix = [
    FFMPEG, '-y',
    '-i', VOICE_FILE,
    '-i', 'bg_music.wav',
    '-filter_complex',
    '[0:a]volume=1.0[v];[1:a]volume=0.35[bg];[v][bg]amix=inputs=2:duration=longest[aout]',
    '-map', '[aout]',
    '-c:a', 'libmp3lame',
    '-b:a', '192k',
    'mughal_final_cinematic_audio.mp3'
]

subprocess.run(cmd_mix, check=True)
print("FINAL CINEMATIC AUDIO MIX CREATED: mughal_final_cinematic_audio.mp3")
