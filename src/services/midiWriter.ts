import { Composition, MidiNote } from '../types';

/**
 * Encodes variable-length quantity for MIDI files
 */
function writeVarLen(value: number): number[] {
  let buffer = value & 0x7f;
  const bytes: number[] = [];
  while ((value >>= 7)) {
    buffer <<= 8;
    buffer |= (value & 0x7f) | 0x80;
  }
  while (true) {
    bytes.push(buffer & 0xff);
    if (buffer & 0x80) {
      buffer >>= 8;
    } else {
      break;
    }
  }
  return bytes;
}

/**
 * Generate a Standard MIDI File (SMF Format 0) ArrayBuffer
 */
export function generateMidiFile(composition: Composition): Uint8Array {
  const ticksPerBeat = 480;
  const events: Array<{
    tick: number;
    bytes: number[];
  }> = [];

  // Set tempo event (microseconds per beat)
  // Microseconds = 60,000,000 / BPM
  const mpqn = Math.round(60000000 / (composition.bpm || 120));
  events.push({
    tick: 0,
    bytes: [0xff, 0x51, 0x03, (mpqn >> 16) & 0xff, (mpqn >> 8) & 0xff, mpqn & 0xff],
  });

  // Track name event
  const titleBytes = Array.from(new TextEncoder().encode(composition.title || 'Neural Sonata Track'));
  events.push({
    tick: 0,
    bytes: [0xff, 0x03, titleBytes.length, ...titleBytes],
  });

  // Map notes into Note-On and Note-Off events
  composition.notes.forEach((note: MidiNote) => {
    const onTick = Math.round(note.startTime * ticksPerBeat);
    const offTick = Math.round((note.startTime + note.duration) * ticksPerBeat);
    const channel = Math.min(15, note.track || 0);

    // Note On (0x90 | channel, pitch, velocity)
    events.push({
      tick: onTick,
      bytes: [0x90 | channel, Math.max(0, Math.min(127, note.pitch)), Math.max(1, Math.min(127, note.velocity))],
    });

    // Note Off (0x80 | channel, pitch, 0)
    events.push({
      tick: offTick,
      bytes: [0x80 | channel, Math.max(0, Math.min(127, note.pitch)), 0],
    });
  });

  // Sort events by tick
  events.sort((a, b) => a.tick - b.tick);

  // Convert to delta-time events
  const trackBytes: number[] = [];
  let lastTick = 0;

  for (const ev of events) {
    const delta = ev.tick - lastTick;
    trackBytes.push(...writeVarLen(Math.max(0, delta)));
    trackBytes.push(...ev.bytes);
    lastTick = ev.tick;
  }

  // End of Track meta-event
  trackBytes.push(...writeVarLen(0));
  trackBytes.push(0xff, 0x2f, 0x00);

  // Build Full File with Header
  // Header: MThd (4 bytes), length 6 (4 bytes), format 0 (2 bytes), 1 track (2 bytes), division (2 bytes)
  const header: number[] = [
    0x4d, 0x54, 0x68, 0x64, // 'MThd'
    0x00, 0x00, 0x00, 0x06, // length 6
    0x00, 0x00,             // format 0
    0x00, 0x01,             // 1 track
    (ticksPerBeat >> 8) & 0xff, ticksPerBeat & 0xff // time division
  ];

  // Track Chunk: MTrk (4 bytes), length (4 bytes), track data
  const trackLength = trackBytes.length;
  const trackHeader: number[] = [
    0x4d, 0x54, 0x72, 0x6b, // 'MTrk'
    (trackLength >> 24) & 0xff,
    (trackLength >> 16) & 0xff,
    (trackLength >> 8) & 0xff,
    trackLength & 0xff
  ];

  const fullBytes = new Uint8Array([...header, ...trackHeader, ...trackBytes]);
  return fullBytes;
}

/**
 * Triggers a browser download for the generated MIDI file
 */
export function downloadMidiFile(composition: Composition): void {
  const bytes = generateMidiFile(composition);
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeTitle = (composition.title || 'neural_sonata').toLowerCase().replace(/[^a-z0-9]+/g, '_');
  a.href = url;
  a.download = `${safeTitle}.mid`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
